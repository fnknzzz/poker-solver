import { AdapterBase } from '../src/ts'
import { normalize } from '../src/utils/normalize'

describe('序列化', () => {
  it('无空缺', () => {
    expect(normalize('778899JQQQKKK2', 'TTAA')).toEqual([
      [[0, 2], [1, 2], [2, 2], [4, 1], [5, 3], [6, 3], [8, 1]],
      [[3, 2], [7, 2]]
    ])
  })
  it('有空缺', () => {
    expect(normalize('7799TT', 'TTAA')).toEqual([
      [[0, 2], [1, 2], [2, 2]],
      [[2, 2], [3, 2]]
    ])
  })
})

describe('cases', () => {
  expect(new AdapterBase('5556', 'AA').rootNode.firstWin).toBe(true)
  expect(new AdapterBase('778899JQQQKKK2', 'TTAA').rootNode.firstWin).toBe(
    false
  )
})
