#![feature(test)]

extern crate test;

pub mod level;
pub mod normalize;
pub mod utils;

use std::collections::HashMap;
use utils::*;

type Hand = (u32, u32);

#[derive(Debug)]
struct Node {
    first: Vec<Hand>,
    second: Vec<Hand>,
    last: Option<Hand>,
    first_win: bool,
    repeat: Option<Vec<u32>>,
}

fn get_reduced_hand(vec: &Vec<Hand>, point: u32) -> Vec<Hand> {
    vec.clone()
        .iter()
        .map(|&k| if k.0 > point { (k.0 - 1, k.1) } else { k })
        .collect()
}

fn get_next_repeat(repeat: &Option<Vec<u32>>, point: u32) -> Option<Vec<u32>> {
    match repeat {
        Some(vec) => {
            let result: Vec<u32> = vec
                .clone()
                .iter()
                .map(|&x| if x < point { x } else { x - 1 })
                .collect();
            if result.len() > 0 {
                Some(result)
            } else {
                None
            }
        }
        None => None,
    }
}

fn play_card(node: &Node, point: u32, n: u32, i: usize) -> Node {
    let total = node.first[i].1;
    if n < total {
        return Node {
            first: node.second.clone(),
            second: delete_index(&node.first, i, Some((point, total - n))),
            last: Some((point, n)),
            repeat: node.repeat.clone(),
            first_win: false,
        };
    } else {
        if node.repeat == None || node.repeat.clone().unwrap().contains(&point) {
            return Node {
                first: get_reduced_hand(&node.second, point),
                second: get_reduced_hand(&delete_index(&node.first, i, None), point),
                last: Some((point - 1, n)),
                repeat: get_next_repeat(&node.repeat, point),
                first_win: false,
            };
        } else {
            return Node {
                first: node.second.clone(),
                second: delete_index(&node.first, i, None),
                last: Some((point, n)),
                repeat: Some(delete_item(&node.repeat.clone().unwrap(), point)),
                first_win: false,
            };
        }
    }
}

fn get_children(node: &Node) -> Vec<Node> {
    let mut result: Vec<Node> = vec![];
    match node.last {
        Some((last_pnt, num)) => {
            for (i, (point, n)) in node.first.iter().enumerate() {
                if *point > last_pnt && *n >= num {
                    result.push(play_card(node, *point, num, i));
                }
            }
            result.push(Node {
                first: node.second.clone(),
                second: node.first.clone(),
                last: None,
                repeat: match &node.repeat {
                    Some(val) => Some(val.clone()),
                    None => None,
                },
                first_win: false,
            })
        }
        None => {
            for (i, (point, n)) in node.first.iter().enumerate() {
                for j in 1..(n + 1) {
                    result.push(play_card(node, *point, j, i))
                }
            }
        }
    };
    result
}

fn get_hand_key(hands: &Vec<Hand>) -> String {
    hands
        .iter()
        .map(|(point, num)| point.to_string() + num.to_string().as_str())
        .collect()
}

fn get_key(node: &Node) -> String {
    let first = get_hand_key(&node.first);
    let second = get_hand_key(&node.second);
    let last = match node.last {
        Some((i, j)) => i.to_string() + j.to_string().as_str(),
        None => String::from(""),
    };
    first + "/" + &*second + "/" + &*last
}

fn mark_winner(node: &mut Node, map: &mut HashMap<String, bool>) {
    if node.first.len() == 0 {
        node.first_win = true;
        return;
    } else if node.second.len() == 0 {
        return;
    }
    let cache_key = get_key(&node);
    if let Some(win) = map.get(&cache_key) {
        node.first_win = *win;
        return;
    }
    let mut chlidren = get_children(node);
    node.first_win = false;
    for child in &mut chlidren {
        mark_winner(child, map);
        if !child.first_win {
            node.first_win = true;
            break;
        }
    }

    map.insert(cache_key, node.first_win);
}

pub fn calculate(s1: &str, s2: &str) -> u32 {
    let (mut a, mut b) = normalize::normalize(s1, s2);
    for i in &mut a {
        i.0 += 1;
    }
    for i in &mut b {
        i.0 += 1;
    }
    let mut repeat = vec![];
    for (i, _) in &a {
        for (j, _) in &b {
            if *i == *j {
                repeat.push(*i);
                break;
            }
        }
    }
    let mut map: HashMap<String, bool> = HashMap::new();
    let mut root_node = Node {
        first: a,
        second: b,
        last: None,
        repeat: if repeat.len() > 0 { Some(repeat) } else { None },
        first_win: false,
    };
    mark_winner(&mut root_node, &mut map);
    if root_node.first_win {
        0u32
    } else {
        1u32
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use test::Bencher;

    #[test]
    fn it_works() {
        assert_eq!(calculate("557", "66"), 0);
        assert_eq!(calculate("346999JA", "34TKK2"), 1);
    }

    #[test]
    fn complex_case() {
        assert_eq!(calculate("778899JQQQKKK2", "TTAA"), 1);
    }

    #[bench]
    fn benchmark(b: &mut Bencher) {
        b.iter(|| calculate("778899JQQQKKK2", "TTAA"));
    }

}
