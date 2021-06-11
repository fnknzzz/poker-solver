#![feature(test)]

extern crate test;

pub mod level;
pub mod utils;

use std::collections::HashMap;
use std::fmt;
use utils::*;
use wasm_bindgen::prelude::*;

// #[cfg(feature = "wee_alloc")]
// #[global_allocator]
// static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
#[derive(Debug, PartialEq, Copy, Clone)]
pub enum Winner {
  First,
  Second,
}

#[derive(Debug, PartialEq)]
enum Output {
  Normal(String),
  Pass,
}

struct Node {
  first: u64,
  second: u64,
  last: Option<u64>,
}

#[wasm_bindgen]
pub struct AiPlayer {
  ai: String,
  challenger: String,
  pub winner: Winner,
  pub end: bool,
  node: Node,
  map: HashMap<u128, Winner>,
}

#[wasm_bindgen]
impl AiPlayer {
  fn cpu_play(&mut self) -> Output {
    let next_node = get_children(&self.node)
      .into_iter()
      .find(|x| x.second == 0 || *self.map.get(&get_key(x)).unwrap() == Winner::Second)
      .unwrap();
    let play = get_output(&next_node, &self.ai);
    self.ai = get_next_hand(&self.ai, &play);
    if next_node.second == 0 {
      self.end = true
    }
    self.node = next_node;
    return play;
  }

  fn get_node_by_text(&self, play: &Output) -> Option<Node> {
    let children = get_children(&self.node);
    match play {
      Output::Pass => children.into_iter().find(|node| node.last == None),
      Output::Normal(text) => children
        .into_iter()
        .filter(|node| node.last != None)
        .find(|node| get_output(node, &self.challenger) == Output::Normal(text.clone())),
    }
  }

  pub fn new(first: &str, second: &str) -> AiPlayer {
    let (a, b) = normalize(first, second);
    let mut map: HashMap<u128, Winner> = HashMap::new();
    let root_node = Node {
      first: a,
      second: b,
      last: None,
    };
    let winner = mark_winner(&root_node, &mut map);
    let (challenger, ai) = if winner == Winner::First {
      (String::from(second), String::from(first))
    } else {
      (String::from(first), String::from(second))
    };
    AiPlayer {
      ai,
      challenger,
      winner,
      node: root_node,
      map,
      end: false,
    }
  }
  pub fn ai_play_default(&mut self) -> String {
    if self.winner == Winner::First {
      if let Output::Normal(s) = self.cpu_play() {
        return s;
      }
    }
    "".to_string()
  }
  pub fn play(&mut self, input: String) -> String {
    let input = input.to_ascii_uppercase().trim().to_string();
    let human_play = if input.len() == 0 {
      Output::Pass
    } else {
      Output::Normal(input)
    };
    if let Some(next_human_node) = self.get_node_by_text(&human_play) {
      self.challenger = get_next_hand(&self.challenger, &human_play);
      self.node = next_human_node;
      convert_output(&self.cpu_play())
    } else {
      "UNKOWN".to_string()
    }
  }
  pub fn get_ai_remain(&self) -> String {
    self.ai.clone()
  }
  pub fn get_challenger_remain(&self) -> String {
    self.challenger.clone()
  }
}

impl fmt::Debug for Node {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    let str = format!(
      "first:  0x{:b}\nsecond: 0x{:b}\nlast: 0x{:b}",
      self.first,
      self.second,
      self.last.unwrap_or(0)
    );
    writeln!(f, "{}", str)
  }
}

fn convert_output(output: &Output) -> String {
  match output {
    Output::Normal(s) => s.to_string(),
    Output::Pass => "".to_string(),
  }
}

fn remove_node_hole(node: Node, helper_val: u64) -> Node {
  if node.first & helper_val == 0
    && node.second & helper_val == 0
    && (node.last == None || node.last.unwrap() & helper_val == 0)
  {
    return Node {
      first: remove_hole(node.first, helper_val),
      second: remove_hole(node.second, helper_val),
      last: node.last.map(|v| remove_hole(v, helper_val)),
      ..node
    };
  }
  node
}

fn get_last_num(last: u64) -> u64 {
  let trailing_zero = last.trailing_zeros();
  let pointer = trailing_zero / 2;
  let num = last >> (pointer * 2);
  num
}

fn get_children(node: &Node) -> Vec<Node> {
  let mut node_child: Vec<Node> = vec![];
  match node.last {
    Some(last) => {
      let trailing_zero = last.trailing_zeros();
      let pointer = trailing_zero / 2;
      let num = last >> (pointer * 2);
      let last_helper_val = 0b11 << (pointer * 2);
      for i in pointer..15 {
        let helper = 0b11 << (i * 2);
        let pointer_num = (helper & node.first) >> (i * 2);
        if pointer_num >= num {
          node_child.push(remove_node_hole(
            Node {
              first: node.second,
              second: (!helper & node.first) | ((pointer_num - num) << (i * 2)),
              last: Some(num << (i * 2)),
            },
            last_helper_val,
          ))
        }
      }

      node_child.push(remove_node_hole(
        Node {
          first: node.second,
          second: node.first,
          last: None,
        },
        last_helper_val,
      ))
    }
    None => {
      for i in 0..15 {
        let helper_val = 0b11 << (i * 2);
        let current_val = helper_val & (node.first);
        if current_val > 0 {
          let num = (node.first >> (2 * i)) & 0b11;
          for n in 1..=num {
            let play = n << (2 * i);
            node_child.push(remove_node_hole(
              Node {
                first: node.second,
                second: node.first - play,
                last: Some(play),
              },
              helper_val,
            ));
          }
        }
      }
    }
  };
  node_child
}

fn get_key(node: &Node) -> u128 {
  let i: u128 = (node.first << 40).into();
  i | u128::from(node.second) | (u128::from(node.last.unwrap_or(0)) << 80)
}

fn get_output(node: &Node, hand: &String) -> Output {
  match node.last {
    Some(last) => {
      let mut index = 0;
      for i in 0..15 {
        let helper = 0b11u64 << (2 * i);
        if helper & last != 0 {
          break;
        } else {
          index += (node.second & helper) >> (2 * i)
        }
      }
      let num = get_last_num(last);
      let output_str: String = hand
        .chars()
        .skip(index as usize)
        .take(num as usize)
        .collect();
      Output::Normal(output_str)
    }
    None => Output::Pass,
  }
}

fn get_next_hand(hand: &String, play: &Output) -> String {
  match play {
    Output::Normal(s) => match s.chars().nth(0) {
      Some(c) => {
        let left: String = hand.chars().take_while(|&x| x != c).collect();
        let left_len = left.len();
        let right: String = hand.chars().skip(left_len + s.len()).collect();
        left + &right
      }
      None => hand.clone(),
    },
    _ => hand.clone(),
  }
}

fn mark_winner(node: &Node, map: &mut HashMap<u128, Winner>) -> Winner {
  let cache_key = get_key(&node);
  if node.first == 0 {
    return Winner::First;
  } else if node.second == 0 {
    return Winner::Second;
  } else {
    if let Some(winner) = map.get(&cache_key) {
      return *winner;
    }
    let chlidren = get_children(node);
    for child in &chlidren {
      let child_winner = mark_winner(child, map);
      let child_cache_key = get_key(&child);
      map.insert(child_cache_key, child_winner);

      if child_winner == Winner::Second {
        return Winner::First;
      }
    }
  }
  Winner::Second
}

pub fn calculate(s1: &str, s2: &str) -> Winner {
  let ai = AiPlayer::new(s1, s2);
  ai.winner
}

#[cfg(test)]
mod tests {
  use super::*;
  use test::Bencher;

  #[test]
  fn it_works() {
    assert_eq!(calculate("55", "66"), Winner::First);
    assert_eq!(calculate("557", "66"), Winner::First);
    assert_eq!(calculate("346999JA", "34TKK2"), Winner::Second);
  }

  #[test]
  fn complex_case() {
    assert_eq!(calculate("778899JQQQKKK2", "TTAA"), Winner::Second);
  }

  #[test]
  fn get_children_test() {
    let node = Node {
      first: 0b0001110100101010,
      second: 0b1000000010000000,
      last: Some(0b0001000000000000),
    };
    get_children(&node);
  }

  #[bench]
  fn benchmark(b: &mut Bencher) {
    b.iter(|| calculate("778899JQQQKKK2", "TTAA"));
  }
}
