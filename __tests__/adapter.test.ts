import { Adapter } from '../src/adapter'
import { generateTree } from '../src/generateTree'

const defaultHand = {
  A: '778899JQQQKKK2',
  B: 'TTAA'
}

const node = generateTree(defaultHand.A, defaultHand.B)

const adapter = new Adapter(node, defaultHand.A, defaultHand.B)

adapter.startPlay()

describe.only('输入输出正确', () => {
  it('输入', () => {
    expect(adapter.getCpuPlayAfterPlayed('T')).toBe(Adapter.InputError)
    expect(adapter.getCpuPlayAfterPlayed('a')).toBe('2')
    expect(adapter.getCpuPlayAfterPlayed('tt')).toBe('qq')
  })
})

