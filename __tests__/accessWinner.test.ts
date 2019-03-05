import { generateTree } from '../src/generateTree'

type Group = [string, string, boolean]

const hands: Group[] = [
  ['88AA', '999T', true],
  ['3', '55', true],
  ['34', '25', false],
  ['558AAA', '22', false],
  ['669JJ', 'TT', true]
]

describe('标记胜负关系', () => {
  hands.forEach(([first, second, firstWin]) => {
    it(`${first}-${second}`, () => {
      const node = generateTree(first, second)
      expect(node.firstWin).toBe(firstWin)
    })
  })
})