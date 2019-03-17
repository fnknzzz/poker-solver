export type hand = [number, number]

export const levelMap = {
  '3': 0,
  '4': 1,
  '5': 2,
  '6': 3,
  '7': 4,
  '8': 5,
  '9': 6,
  T: 7,
  J: 8,
  Q: 9,
  K: 10,
  A: 11,
  '2': 12,
  B: 13,
  C: 14
}

export type pokerName = keyof typeof levelMap
