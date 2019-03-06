import { normalize } from '../serialize'

// const map: { [key: string]: boolean } = {}

export const tupleStore: { [key: string]: [number, number] } = {}

export type hand = keyof typeof tupleStore

export interface INode {
  first: hand[]
  second: hand[]
  last: hand | null
  children: INode[]
  firstWin?: boolean
}

export const deleteIndex = <T>(arr: T[], n: number, item?: T) => {
  const copy = arr.slice()
  if (item) {
    copy.splice(n, 1, item)
  } else {
    copy.splice(n, 1)
  }
  return copy
}

const findChildren = (node: INode) => {
  if (!node.first.length || !node.second.length) return
  if (!node.last) {
    node.first.forEach((key, index) => {
      const [poker, n] = tupleStore[key]
      for (let i = 1; i <= n; i++) {
        node.children.push({
          first: node.second,
          second:
            i === n
              ? deleteIndex(node.first, index)
              : deleteIndex(node.first, index, '' + poker + (n - i)),
          last: '' + poker + i,
          children: []
        })
      }
    })
  } else {
    const [lastPoker, num] = tupleStore[node.last]
    node.first.forEach((key, index) => {
      const [poker, n] = tupleStore[key]
      if (poker > lastPoker && n >= num) {
        node.children.push({
          first: node.second,
          second:
            n === num
              ? deleteIndex(node.first, index)
              : deleteIndex(node.first, index, '' + poker + (n - num)),
          last: '' + poker + num,
          children: []
        })
      }
    })
    node.children.push({
      first: node.second,
      second: node.first,
      last: null,
      children: []
    })
  }
  node.children.forEach(child => findChildren(child))
}

const markNodeWinner = (node: INode) => {
  if (!node.first.length) {
    node.firstWin = true
    return
  } else if (!node.second.length) {
    node.firstWin = false
    return
  }
  for (const child of node.children) {
    markNodeWinner(child)
  }
  node.firstWin = node.children.some(k => !k.firstWin)
}

const initStore = (maxPoint: number, maxLen: number) => {
  for (let i = 0; i <= maxPoint; i++) {
    for (let j = 1; j <= maxLen; j++) {
      tupleStore['' + i + j] = [i, j]
    }
  }
}

export const getTree = (sA: string, sB: string) => {
  const { A, B } = normalize(sA, sB)
  initStore(
    Math.max(A[A.length - 1][0], B[B.length - 1][0]),
    Math.max(...A.map(k => k[1]), ...B.map(k => k[1]))
  )
  const rootNode: INode = {
    first: A.map(([a, b]) => '' + a + b),
    second: B.map(([a, b]) => '' + a + b),
    last: null,
    children: []
  }
  findChildren(rootNode)
  markNodeWinner(rootNode)
  return rootNode
}
