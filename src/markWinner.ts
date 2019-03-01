import { INode } from './generateTree'

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
    if ((child.last && !child.firstWin) || (!child.last && child.firstWin)) {
      node.firstWin = true
      break
    }
  }
  node.firstWin = false
}

export const markWinner = (node: INode) => markNodeWinner(node)
