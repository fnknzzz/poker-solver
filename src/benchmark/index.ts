import Benchmark, { Event, Suite } from 'benchmark'
import { calculate } from '../ts'
import { cases } from './case'

const suite = new Benchmark.Suite()

suite
  .add('typescript', () => {
    calculate(cases[0], cases[1])
  })
  .on('cycle', (event: Event) => {
    console.log(event.target.toString())
  })
  .on('complete', function(this: Suite) {
    console.log(this.filter('fastest').map('name'))
  })
  .run({
    async: false
  })
