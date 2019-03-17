import filesize from 'filesize'
import readline from 'readline'
import { Adapter } from './ts'

export { Adapter }

export interface IAdapter {
  [Symbol.iterator](): IterableIterator<string | null>
  getInfo(): [string, string]
}

// const A = '8899JKKK2'
const A = '778899JQQQKKK2'
const B = 'TTAA'

// const A = '346999JA'
// const B = '34TKK2'

// const A = '2KKKQQQ997766553'
// const B = 'AAJJ'

const adapter: Adapter = new Adapter(
  A,
  B,
  calc => (...args: Parameters<typeof calc>) => {
    console.time('所用时间')
    const result = calc(...args)
    console.timeEnd('所用时间')
    console.log('占用内存:', filesize(process.memoryUsage().rss))
    return result
  }
)

const logInfo = () => {
  const [A, B] = adapter.getInfo()
  console.log('    A:', A)
  console.log('    B:', B)
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '你出牌吧>> '
})

logInfo()
const generator = adapter[Symbol.iterator]()
const startText = generator.next().value
if (startText) {
  console.log('先手赢, 我先你后')
  console.log('我出:', startText)
  logInfo()
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
  logInfo()
  rl.prompt()
}).on('close', () => {
  console.log('\n')
})
