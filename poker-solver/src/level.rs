const MAP: [char; 15] = [
  '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A', '2', 'B', 'C',
];

pub fn get_level(c: &char) -> u32 {
  for i in 0..15 {
    if MAP[i] == *c {
      return i as u32;
    }
  }
  panic!("Not excepted char: {}", c)
}
