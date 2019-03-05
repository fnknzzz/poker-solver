import filesize from 'filesize'
import readline from 'readline'
import { Adapter } from './v1'

export { Adapter }

export interface IEventListener {
  StartEvalute(): void
  EndEvalute(): void
}

export interface IAdapter {
  getOutputByInput(text: string): string | null
  isGameOver(): boolean
  getInfo(): [string, string]
  getFirstPlayText(): string
}

const A = '8899JKKK2'
// const A = '778899JQQQKKK2'
const B = 'TTAA'

const adapter: Adapter = new Adapter(A, B, {
  StartEvalute: () => console.time('所用时间'),
  EndEvalute: () => console.timeEnd('所用时间')
})

console.log('占用内存:', filesize(process.memoryUsage().rss))

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
const startText = adapter.getFirstPlayText()
if (startText) {
  console.log('先手赢, 我先你后')
  console.log('我出:', startText)
  logInfo()
} else {
  console.log('后手赢, 你先出吧')
}
rl.prompt()
rl.on('line', line => {
  const result = adapter.getOutputByInput(line)
  if (result === null) {
    console.log('Orz...输入错误哦，重试吧')
    rl.prompt()
    return
  } else if (result) {
    console.log('我出:', result)
  } else {
    console.log('我不出')
  }
  logInfo()
  if (adapter.isGameOver()) {
    console.log('出完啦')
    rl.close()
  } else {
    rl.prompt()
  }
}).on('close', () => {
  console.log('\n')
})
