import serialize from '../src/serialize'

describe('序列化', () => {
  it('无空缺', () => {
    expect(serialize('778899JQQQKKK2', 'TTAA')).toEqual({
      A: '00112245556668',
      B: '3377'
    })
  })
  it('有空缺', () => {
    expect(serialize('7799TT', 'TTAA')).toEqual({
      A: '001122',
      B: '2233'
    })
  })
})
