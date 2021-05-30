use poker::*;
use std::env;
use std::io::stdin;

fn main() {
  let args: Vec<String> = env::args().collect();
  let (default_a, default_b) = (String::from("778899JQQQKKK2"), String::from("TTAA"));
  let (a, b) = if args.get(1) != None && args.get(2) != None {
    (&args[1], &args[2])
  } else {
    (&default_a, &default_b)
  };
  let (ans, mut out) = calculate(a, b);
  let print_info = |(play, human, cpu): (Output, String, String)| {
    match play {
      Output::Invalid => println!("你出错了，不能这样出"),
      Output::Normal(n) => println!("我出: {}", n),
      Output::Pass => println!("我不出，你继续吧"),
    };
    println!("剩下手牌为：\n{}\n{}", human, cpu);
  };
  if ans == Winner::First {
    println!("先手胜，我执先手。\n我的牌：{}\n你的牌：{}", a, b);
    print_info(out(&""));
  } else {
    println!("后手胜，我执后手，你出牌吧。\n我的牌：{}\n你的牌：{}", b, a);
    out(&"");
  }
  loop {
    let mut input = String::new();
    stdin().read_line(&mut input).expect("Failed to readln.");
    print_info(out(&input));
  }
}
