type poker = '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A' | '2'

export interface ISerialize {
  A: string
  B: string
}

const poker2Order = (p: poker): number => {
  switch (p) {
    case 'T':
      return 3
    case 'J':
      return 4
    case 'Q':
      return 5
    case 'K':
      return 6
    case 'A':
      return 7
    case '2':
      return 8
    default:
      return parseInt(p, 10) - 7
  }
}

export default function(A: string, B: string): ISerialize {
  const sA = (A.split('') as poker[]).map(poker2Order)
  const sB = (B.split('') as poker[]).map(poker2Order)
  const a: boolean[] = new Array(9)
  const unreach: number[] = []
  sA.forEach(k => {
    a[k] = true
  })
  sB.forEach(k => {
    a[k] = true
  })
  for (let i = 0; i < 9; i++) {
    if (!a[i]) {
      unreach.push(i)
    }
  }
  unreach.forEach((i, j) => {
    for (let k = 0; k < sA.length; k++) {
      if (sA[k] > i - j) {
        sA[k]--
      }
    }
    for (let k = 0; k < sB.length; k++) {
      if (sB[k] > i - j) {
        sB[k]--
      }
    }
  })
  return {
    A: sA.join(''),
    B: sB.join('')
  }
}
