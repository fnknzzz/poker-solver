import filesize from 'filesize'
import readline from 'readline'
import { AdapterBase } from './ts'

export interface AbstractAdapter {
  [Symbol.iterator](): IterableIterator<string | null>
  calculate(): void
  getInfo(): [string, string]
}

const A = '778899JQQQKKK2'
const B = 'TTAA'

// const A = '346999JA'
// const B = '34TKK2'

// const A = '2KKKQQQ997766553'
// const B = 'AAJJ'

class Adaper extends AdapterBase {
  constructor(A: string, B: string) {
    super(A, B)
  }
  public logInfo() {
    const [A, B] = super.getInfo()
    console.log('    A:', A)
    console.log('    B:', B)
  }
  public calculate() {
    console.time('所用时间')
    const result = super.calculate()
    console.timeEnd('所用时间')
    console.log('占用内存:', filesize(process.memoryUsage().rss))
    return result
  }
}

const adapter = new Adaper(A, B)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '你出牌吧>> '
})

adapter.logInfo()
const generator = adapter[Symbol.iterator]()
const startText = generator.next().value
if (startText) {
  console.log('先手赢, 我先你后')
  console.log('我出:', startText)
  adapter.logInfo()
} else {
  console.log('后手赢, 你先出吧')
}
rl.prompt()
rl.on('line', line => {
  const { value, done } = generator.next(line)
  if (value === null) {
    console.log('Orz...输入错误哦，重试吧')
    rl.prompt()
    return
  } else if (value) {
    console.log('我出:', value)
    if (done) {
      console.log('出完啦')
      rl.close()
      return
    }
  } else {
    console.log('我不出')
  }
  adapter.logInfo()
  rl.prompt()
}).on('close', () => {
  console.log('\n')
})
