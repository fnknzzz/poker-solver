use criterion::{criterion_group, criterion_main, Criterion};
use poker_solver::calculate;

pub fn poker_benchmark(c: &mut Criterion) {
    c.bench_function("poker_solver", |b| {
        b.iter(|| calculate("778899JQQQKKK2", "TTAA"))
    });
}

criterion_group!(benches, poker_benchmark);
criterion_main!(benches);