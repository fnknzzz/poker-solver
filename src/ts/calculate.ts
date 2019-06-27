import { deleteIndex, deleteItem, hand, normalize } from '../utils'

export const map: { [key: string]: boolean } = {}

export const tupleStore: { [key: string]: hand } = {}

export interface INode {
  first: string[]
  second: string[]
  last: string | null
  firstWin: boolean
  repeat: number[] | null
}

const playCard = (
  node: INode,
  point: number,
  n: number,
  index: number
): INode => {
  const total = tupleStore[node.first[index]][1]
  if (n < total) {
    return {
      first: node.second,
      second: deleteIndex(node.first, index, getKeyFromTuple(point, total - n)),
      last: '' + point + n,
      repeat: node.repeat,
      firstWin: false
    }
  } else {
    if (!node.repeat || !node.repeat.includes(point)) {
      return {
        first: getReducedHand(node.second, point),
        second: getReducedHand(deleteIndex(node.first, index), point),
        last: getKeyFromTuple(point - 1, n),
        repeat: getNextRepeat(node.repeat, point),
        firstWin: false
      }
    } else {
      return {
        first: node.second,
        second: deleteIndex(node.first, index),
        last: getKeyFromTuple(point, n),
        repeat: deleteItem(node.repeat, point),
        firstWin: false
      }
    }
  }
}

export const getNextRepeat = (
  repeat: INode['repeat'],
  point: number
): INode['repeat'] => {
  if (!repeat) return null
  const result = []
  for (const p of repeat) {
    if (p < point) {
      result.push(p)
    } else if (p > point) {
      result.push(p - 1)
    }
  }
  return result.length ? result : null
}

export const getReducedHand = (hands: string[], p: number) =>
  hands.map(k => {
    const [point, num] = tupleStore[k]
    return point > p ? getKeyFromTuple(point - 1, num) : k
  })

export const getChildren = (node: INode) => {
  const result: INode[] = []
  if (!node.last) {
    node.first.forEach((key, index) => {
      const [point, n] = tupleStore[key]
      for (let i = 1; i <= n; i++) {
        result.push(playCard(node, point, i, index))
      }
    })
  } else {
    const [lastPoker, num] = tupleStore[node.last]
    node.first.forEach((key, index) => {
      const [point, n] = tupleStore[key]
      if (point > lastPoker && n >= num) {
        result.push(playCard(node, point, num, index))
      }
    })
    result.push({
      first: node.second,
      second: node.first,
      last: null,
      repeat: node.repeat,
      firstWin: false
    })
  }
  return result
}

export const getCacheKey = (node: INode) =>
  node.first.join('') + '/' + node.second.join('') + '/' + (node.last || '')

const getKeyFromTuple = (point: number, num: number) => point.toString(16) + num

const markNodeWinner = (node: INode) => {
  if (!node.first.length) {
    node.firstWin = true
  } else if (!node.second.length) {
    node.firstWin = false
  } else {
    const key = getCacheKey(node)
    if (map[key] !== undefined) {
      node.firstWin = map[key]
      return
    }
    const children = getChildren(node)
    node.firstWin = false
    for (const child of children) {
      markNodeWinner(child)
      if (!child.firstWin) {
        node.firstWin = true
        break
      }
    }
    map[key] = node.firstWin
  }
}

const initStore = (maxPoint: number, maxLen: number) => {
  for (let i = 0; i <= maxPoint; i++) {
    for (let j = 1; j <= maxLen; j++) {
      tupleStore[getKeyFromTuple(i, j)] = [i, j]
    }
  }
}

export const calculate = (sA: string, sB: string) => {
  const [A, B] = normalize(sA, sB)
  
  // 留出 0 的空位，从 1 开始，防止重新标准化后出现 -1
  A.forEach(k => k[0]++)
  B.forEach(k => k[0]++)
  initStore(
    Math.max(A[A.length - 1][0], B[B.length - 1][0]),
    Math.max(...A.map(k => k[1]), ...B.map(k => k[1]))
  )
  const repeat: INode['repeat'] = []
  const bPoints = B.map(k => k[0])
  A.forEach(([point]) => {
    if (bPoints.includes(point)) {
      repeat.push(point)
    }
  })
  const rootNode: INode = {
    first: A.map(([a, b]) => getKeyFromTuple(a, b)),
    second: B.map(([a, b]) => getKeyFromTuple(a, b)),
    last: null,
    repeat: repeat.length ? repeat : null,
    firstWin: false
  }
  markNodeWinner(rootNode)
  return rootNode
}
