import { generateTree } from './generateTree';
import { markWinner } from './markWinner';

const defaultHand = {
  A: '778899JQQQKKK2',
  B: 'TTAA'
}

console.time('calc')

const node = generateTree(defaultHand.A, defaultHand.B)
markWinner(node)

console.timeEnd('calc')

console.log(node.firstWin)