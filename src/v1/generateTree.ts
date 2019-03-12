import { normalize } from '../utils/serialize'

export type hand = Array<[number, number]>
export interface INode {
  first: hand
  second: hand
  last: [number, number] | null
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
    node.first.forEach(([poker, n], index) => {
      for (let i = 1; i <= n; i++) {
        node.children.push({
          first: node.second,
          second:
            i === n
              ? deleteIndex(node.first, index)
              : deleteIndex(node.first, index, [poker, n - i]),
          last: [poker, i],
          children: []
        })
      }
    })
  } else {
    const [lastPoker, num] = node.last
    node.first.forEach(([poker, n], index) => {
      if (poker > lastPoker && n >= num) {
        node.children.push({
          first: node.second,
          second:
            n === num
              ? deleteIndex(node.first, index)
              : deleteIndex(node.first, index, [poker, n - num]),
          last: [poker, num],
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

export const generateTree = (sA: string, sB: string) => {
  const { A, B } = normalize(sA, sB)
  const rootNode: INode = {
    first: A,
    second: B,
    last: null,
    children: []
  }
  findChildren(rootNode)
  markNodeWinner(rootNode)
  return rootNode
}
