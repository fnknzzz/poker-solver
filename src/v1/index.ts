import { IAdapter, IEventListener } from '../'
import { generateTree, INode } from './generateTree'

export class Adapter implements IAdapter {
  public node: INode
  private first: string[]
  private second: string[]
  private cpu: string[]
  private human: string[]

  constructor(firstStr: string, secondStr: string, listeners: IEventListener) {
    listeners.StartEvalute()
    this.node = generateTree(firstStr, secondStr)
    listeners.EndEvalute()
    this.first = firstStr.split('')
    this.second = secondStr.split('')
    this.cpu = this.node.firstWin ? this.first : this.second
    this.human = this.node.firstWin ? this.second : this.first
  }

public *[Symbol.iterator]() {
  yield '1'
}

  public getInfo() {
    return [this.first.join(''), this.second.join('')] as [string, string]
  }

  public getOutputByInput(text: string) {
    text = text.trim().toUpperCase()
    const nextNode = this.getNodeByText(text)
    if (!nextNode) {
      return null
    }
    this.updateHand(this.human, text)
    this.node = nextNode
    return this.getCpuPlayText()
  }

  public isGameOver() {
    return !this.cpu.length
  }

  public getFirstPlayText() {
    if (this.node.firstWin) {
      return this.getCpuPlayText()
    }
    return ''
  }

  private getCpuPlayText() {
    const nextNode = this.node.children.find(k => !k.firstWin)!
    const text = this.getCpuText(nextNode)
    if (text) {
      this.updateHand(this.cpu, text)
    }
    this.node = nextNode
    return text
  }

  private getCpuText(nextNode: INode) {
    if (!nextNode.last) return ''
    let index = 0
    for (const [point, num] of nextNode.second) {
      if (point < nextNode.last[0]) {
        index += num
      } else {
        break
      }
    }
    return this.cpu.slice(index, index + nextNode.last[1]).join('')
  }

  private getNodeByText(text: string) {
    if (!Array.prototype.every.call(text, (k: string) => k === text[0])) {
      return null
    }
    if (!text) {
      return this.node.children.find(k => k.last === null)
    }
    let index = 0
    let prev = this.human[0]
    for (const point of this.human) {
      if (point !== prev) {
        index++
        prev = point
      }
      if (text[0] === point) {
        break
      }
    }
    return this.node.children.find(
      node =>
        !!node.last &&
        node.last[0] === this.node.first[index][0] &&
        node.last[1] === text.length
    )
  }

  private updateHand(player: string[], text: string) {
    const point = text[0]
    const index = player.indexOf(point)
    player.splice(index, text.length)
  }
}
