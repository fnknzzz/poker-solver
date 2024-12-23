use criterion::{black_box, criterion_group, criterion_main, Criterion};
use poker_solver::calculate;

pub fn poker_benchmark(c: &mut Criterion) {
    let mut group = c.benchmark_group("poker_solver");
    group.bench_function("complex case", |b| {
        b.iter(|| calculate(black_box("778899JQQQKKK2"), black_box("TTAA")))
    });
    group.bench_function("simple case", |b| {
        b.iter(|| calculate(black_box("55"), black_box("66")))
    });
    group.finish();
}

criterion_group!(poker_benches, poker_benchmark);
criterion_main!(poker_benches);
