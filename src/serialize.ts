import { hand } from './constants'

const levelMap: { [key: string]: number } = {
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
  '2': 12
}

export type poker = keyof typeof levelMap

export const normalize = (A: string, B: string) => {
  const pA = A.split('').map(k => levelMap[k])
  const pB = B.split('').map(k => levelMap[k])
  const target = [...pA, ...pB]
  const temp = new Array(Math.max(...target)).fill(false)
  target.forEach(n => (temp[n] = true))
  let level = 0
  temp.forEach(k => {
    if (!k) {
      for (let i = 0; i < target.length; i++) {
        if (target[i] > level) {
          target[i]--
        }
      }
      level--
    }
    level++
  })
  return {
    A: string2Hand(target.slice(0, pA.length).join('')),
    B: string2Hand(target.slice(pA.length).join(''))
  }
}

export const string2Hand = (k: string) => {
  const result: hand = []
  Array.prototype.forEach.call(k, (c: string) => {
    const level = +c
    if (!result.length || result[result.length - 1][0] !== level) {
      result.push([level, 1])
    } else {
      result[result.length - 1][1]++
    }
  })
  return result
}

export const hand2String = (k: hand) =>
  k.map(([level, n]) => ('' + level).repeat(n)).join('')
