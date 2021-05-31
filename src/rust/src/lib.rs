#![feature(test)]

extern crate test;

pub mod level;
pub mod utils;

use std::collections::HashMap;
use std::fmt;
use utils::*;

#[derive(Debug, PartialEq, Copy, Clone)]
pub enum Winner {
  First,
  Second,
}

#[derive(Debug, PartialEq)]
pub enum Output {
  Invalid,
  Normal(String),
  Pass,
}

struct Node {
  first: u64,
  second: u64,
  last: Option<u64>,
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

pub fn calculate(s1: &str, s2: &str) -> (Winner, Box<dyn FnMut(&str) -> (Output, String, String)>) {
  let (a, b) = normalize(s1, s2);

  let mut map: HashMap<u128, Winner> = HashMap::new();
  let root_node = Node {
    first: a,
    second: b,
    last: None,
  };
  let winner = mark_winner(&root_node, &mut map);
  let first_win = winner == Winner::First;
  let mut first = true;
  let (mut human, mut cpu) = if first_win {
    (String::from(s2), String::from(s1))
  } else {
    (String::from(s1), String::from(s2))
  };
  let mut current = root_node;
  let output = Box::new(move |text: &str| {
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
      let mut play_str = None;
      if let Output::Normal(s) = play {
        play_str = Some(s);
      };
      if play_str == None {
        return hand.clone();
      };
      match play_str.unwrap().chars().nth(0) {
        Some(c) => {
          let left: String = hand.chars().take_while(|&x| x != c).collect();
          let left_len = left.len();
          let right: String = hand
            .chars()
            .skip(left_len + play_str.unwrap().len())
            .collect();
          left + &right
        }
        None => hand.clone(),
      }
    }
    let get_node_by_text = |play: &Output| {
      let children = get_children(&current);
      match play {
        Output::Pass => children.into_iter().find(|node| node.last == None),
        Output::Normal(text) => children
          .into_iter()
          .filter(|node| node.last != None)
          .find(|node| get_output(node, &human) == Output::Normal(text.clone())),
        _ => panic!(""),
      }
    };
    let get_cpu_next_node = |current: &Node| {
      let children = get_children(current);
      children
        .into_iter()
        .find(|x| x.second == 0 || (*map.get(&get_key(x)).unwrap() == Winner::Second))
        .unwrap()
    };
    let mut cpu_play = |current: &Node| {
      let next_node = get_cpu_next_node(current);
      let play = get_output(&next_node, &cpu);
      cpu = get_next_hand(&cpu, &play);
      (play, next_node)
    };
    if first {
      first = false;
      if first_win {
        let (play, next_node) = cpu_play(&current);
        current = next_node;
        return (play, human.clone(), cpu.clone());
      } else {
        return (Output::Pass, human.clone(), cpu.clone());
      }
    };
    let text = text.to_ascii_uppercase().trim().to_string();
    let human_play = if text.len() == 0 {
      Output::Pass
    } else {
      Output::Normal(text)
    };
    if let Some(next_human_node) = get_node_by_text(&human_play) {
      human = get_next_hand(&human, &human_play);
      let (play, next_cpu_node) = cpu_play(&next_human_node);
      current = next_cpu_node;
      (play, human.clone(), cpu.clone())
    } else {
      (Output::Invalid, human.clone(), cpu.clone())
    }
  });
  if first_win {
    (Winner::First, output)
  } else {
    (Winner::Second, output)
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use test::Bencher;

  #[test]
  fn it_works() {
    assert_eq!(calculate("55", "66").0, Winner::First);
    assert_eq!(calculate("557", "66").0, Winner::First);
    assert_eq!(calculate("346999JA", "34TKK2").0, Winner::Second);
  }

  #[test]
  fn complex_case() {
    assert_eq!(calculate("778899JQQQKKK2", "TTAA").0, Winner::Second);
  }

  #[test]
  #[ignore]
  fn right_output() {
    let (winner, mut output) = calculate("778899JQQQKKK2", "TTAA");
    assert_eq!(winner, Winner::Second);
    assert_eq!(output(&"").0, Output::Pass);
    assert_eq!(output(&"77").0, Output::Normal("TT".into()));
    assert_eq!(output(&"QQ").0, Output::Normal("AA".into()));
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
