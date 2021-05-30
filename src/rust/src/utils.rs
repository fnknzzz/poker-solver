use crate::level::*;
pub fn remove_hole(val: u64, helper_val: u64) -> u64 {
  let tail = val & (helper_val - 1);
  ((val - tail) >> 2) | tail
}

fn trans_to_int(s: &str) -> u64 {
  let mut r = 0u64;
  for c in s.chars() {
    let level = get_level(&c);
    r += 1 << (level * 2)
  }
  r
}

fn remove_zeros(n: u64, i: i32) -> u64 {
  let helper = (1 << (i * 2 + 1)) - 1;
  let trail = n & helper;
  ((n & (!helper)) >> 2) | trail
}

pub fn normalize(s1: &str, s2: &str) -> (u64, u64) {
  let mut i1 = trans_to_int(s1);
  let mut i2 = trans_to_int(s2);
  let mut rm_index = 0;
  for k in 0..15 {
    let i = k - rm_index;
    let helper = 0b11 << (i * 2);
    if i1 & helper == 0 && i2 & helper == 0 {
      i1 = remove_zeros(i1, i);
      i2 = remove_zeros(i2, i);
      rm_index += 1;
    }
  }
  (i1, i2)
}

#[cfg(test)]
mod tests {
  use super::*;
  #[test]
  fn normal_1() {
    assert_eq!(
      normalize("778899JQQQKKK2", "TTAA"),
      (0b010011110100101010u64, 0b001000000010000000u64)
    );
  }
  #[test]
  fn normal_2() {
    assert_eq!(
      normalize("77882", "TTA"),
      (0b0100001010u64, 0b0001100000u64)
    );
  }

  #[test]
  fn test_to_int() {
    assert_eq!(
      trans_to_int("778899JQQQKKK2"),
      0b1001111010010101000000000u64
    )
  }
}
