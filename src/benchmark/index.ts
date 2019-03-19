import Benchmark from 'benchmark'
import { calculate } from '../ts'
import { cases } from './case'

const suite = new Benchmark.Suite()

suite
  .add('typescript', () => {
    calculate(cases[0], cases[1])
  })
  .on('cycle', function(event: { target: any; }) {
    console.log(event.target.toString());
  })
  .on('complete', function() {
    // @ts-ignore
    console.log(this.filter('fastest').map('name'))
  })
  .run({
    async: false
  })
