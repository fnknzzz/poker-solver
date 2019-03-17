import { hand } from './type'

interface INode {
  first: hand[]
  second: hand[]
  last: hand | null
}

export const getDeltaText = (child: INode, hand: string | string[]) => {
  if (typeof hand !== 'string') {
    hand = hand.join('')
  }
  if (!child.last) return ''
  let index = 0
  const [point, length] = child.last
  for (const [p, n] of child.second) {
    if (point > p) {
      index += n
    } else {
      break
    }
  }
  return hand.slice(index, index + length)
}

export const deleteIndex = <T>(arr: T[], index: number, item?: T) => {
  const copy = arr.slice()
  if (item) {
    copy.splice(index, 1, item)
  } else {
    copy.splice(index, 1)
  }
  return copy
}

export const deleteItem = <T>(arr: T[], item: T) => {
  const result: T[] = []
  arr.forEach(k => {
    if (k !== item) {
      result.push(k)
    }
  })
  return result
}

export * from './normalize'
export * from './type'
