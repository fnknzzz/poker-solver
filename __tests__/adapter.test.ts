import { Adapter } from '../src/v3'

const A = '778899JQQQKKK2'
const B = 'TTAA'

describe('start', () => {
  const adapter = new Adapter(A, B, {
    StartEvalute: () => {},
    EndEvalute: () => {}
  })

  const generator = adapter[Symbol.iterator]()
  const play = ['j', 'q', '7', '2', '7', 'K', '']
  const response = ['', '', 'T', '', 'T', 'A', 'A']
  expect(generator.next().value).toBe('')
  let result: IteratorResult<string | null> = { value: '', done: false }
  for (let i = 0; i <= play.length; i++) {
    result = generator.next(play[i])
    expect(result.value).toBe(response[i])
    expect(result.done).toBe(i === play.length - 1)
  }
})
