use poker::*;
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();

    let a = &args[1];
    let b = &args[2];

    println!("{}", calculate(&*a, &*b));
}
