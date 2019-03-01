import { normalize } from '../src/serialize'

describe('序列化', () => {
  it('无空缺', () => {
    expect(normalize('778899JQQQKKK2', 'TTAA')).toEqual({
      A: [[0, 2], [1, 2], [2, 2], [4, 1], [5, 3], [6, 3], [8, 1]],
      B: [[3, 2], [7, 2]]
    })
  })
  it('有空缺', () => {
    expect(normalize('7799TT', 'TTAA')).toEqual({
      A: [[0, 2], [1, 2], [2, 2]],
      B: [[2, 2], [3, 2]]
    })
  })
})
