import { IAdapter, IEventListener } from '../'
import { getDeltaText } from '../utils'
import {
  calculate,
  getChildren,
  getKey,
  INode,
  map,
  tupleStore
} from './calculate'

export class Adapter implements IAdapter {
  public node: INode
  private first: string[]
  private second: string[]
  private cpu: string[]
  private human: string[]

  constructor(firstStr: string, secondStr: string, listeners: IEventListener) {
    listeners.StartEvalute()
    this.node = calculate(firstStr, secondStr)
    listeners.EndEvalute()
    this.first = firstStr.split('')
    this.second = secondStr.split('')
    this.cpu = this.node.firstWin ? this.first : this.second
    this.human = this.node.firstWin ? this.second : this.first
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
    if (map[getKey(this.node)] === true) {
      return this.getCpuPlayText()
    }
    return ''
  }

  private getCpuPlayText() {
    const children = getChildren(this.node)
    const nextNode = children.find(k => !map[getKey(k)])!
    const text = getDeltaText(
      {
        first: nextNode.first.map(k => tupleStore[k]),
        second: nextNode.second.map(k => tupleStore[k]),
        last: nextNode.last ? tupleStore[nextNode.last] : null
      },
      this.cpu
    )
    if (text) {
      this.updateHand(this.cpu, text)
    }
    this.node = nextNode
    return text
  }

  private getNodeByText(text: string) {
    if (!Array.prototype.every.call(text, (k: string) => k === text[0])) {
      return null
    }
    const children = getChildren(this.node)
    if (!text) {
      return children.find(k => k.last === null)
    }
    return children
      .filter(k => k.last)
      .find(
        child =>
          getDeltaText(
            {
              first: child.first.map(k => tupleStore[k]),
              second: child.second.map(k => tupleStore[k]),
              last: tupleStore[child.last!]
            },
            this.human
          ) === text
      )
  }

  private updateHand(player: string[], text: string) {
    const point = text[0]
    const index = player.indexOf(point)
    player.splice(index, text.length)
  }
}
