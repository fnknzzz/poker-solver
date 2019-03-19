import { IAdapter } from '../'
import { getDeltaText, levelMap, pokerName } from '../utils'
import {
  calculate,
  getCacheKey,
  getChildren,
  INode,
  map,
  tupleStore
} from './calculate'

const isWin = (node: INode) => map[getCacheKey(node)]

export class Adapter implements IAdapter {
  public readonly rootNode: INode
  public readonly firstStr: string
  public readonly secondStr: string
  private node: INode
  private first: string[]
  private second: string[]
  private cpu: string[]
  private human: string[]

  constructor(
    firstStr: string,
    secondStr: string,
    decorator?: (calcProcedure: typeof calculate) => typeof calculate
  ) {
    const calculateFunc = decorator ? decorator(calculate) : calculate
    firstStr = firstStr
      .split('')
      .sort((a, b) => levelMap[a as pokerName] - levelMap[b as pokerName])
      .join('')
    secondStr = secondStr
      .split('')
      .sort((a, b) => levelMap[a as pokerName] - levelMap[b as pokerName])
      .join('')
    this.rootNode = calculateFunc(firstStr, secondStr)
    this.firstStr = firstStr
    this.secondStr = secondStr
    this.node = this.rootNode
    this.first = this.firstStr.split('')
    this.second = this.secondStr.split('')
    this.cpu = isWin(this.rootNode) ? this.first : this.second
    this.human = isWin(this.rootNode) ? this.second : this.first
  }

  public *[Symbol.iterator]() {
    let text: string
    if (map[getCacheKey(this.node)]) {
      text = yield this.cpuPlay()
    } else {
      text = yield ''
    }
    while (true) {
      text = text.trim().toUpperCase()
      const nextNode = this.getNodeByText(text)
      if (!nextNode) {
        text = yield null
        continue
      }
      this.updateHand(this.human, text)
      this.node = nextNode
      const playText = this.cpuPlay()
      if (!this.cpu.length) {
        return playText
      } else {
        text = yield playText
      }
    }
  }

  public getInfo() {
    return [this.first.join(''), this.second.join('')] as [string, string]
  }

  private cpuPlay() {
    const children = getChildren(this.node)
    const nextNode = children.find(k => !map[getCacheKey(k)])!
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
    if (!text.length) return
    const point = text[0]
    const index = player.indexOf(point)
    player.splice(index, text.length)
  }
}

export { calculate }
