import { defaultHand } from './constants'
import { generateTree } from './generateTree';

const node = generateTree(defaultHand.A, defaultHand.B)

console.log(node)