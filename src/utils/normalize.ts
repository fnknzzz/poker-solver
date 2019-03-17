import { hand } from '../v1/generateTree'
import { levelMap, pokerName } from './type'

export const normalize = (...strs: string[]) => {
  if (!strs.length) return []
  const levels = strs.map(str => str.split('').map(k => levelMap[k as pokerName]))
  const target = levels.reduce((a, b) => [...a, ...b], [])
  const temp = new Array(Math.max(...target)).fill(false)
  target.forEach(n => (temp[n] = true))
  let level = 0
  temp.forEach(k => {
    if (!k) {
      for (let i = 0; i < target.length; i++) {
        if (target[i] > level) {
          target[i]--
        }
      }
      level--
    }
    level++
  })
  const devideIndex = [0]
  for (let i = 0; i < strs.length; i++) {
    const length = strs[i].length
    devideIndex.push(length + devideIndex[i])
  }
  return strs.map((k, i) => {
    const points = target.slice(devideIndex[i], devideIndex[i + 1])
    const result: hand = []
    points.forEach(level => {
      if (!result.length || result[result.length - 1][0] !== level) {
        result.push([level, 1])
      } else {
        result[result.length - 1][1]++
      }
    })
    return result
  })
}
