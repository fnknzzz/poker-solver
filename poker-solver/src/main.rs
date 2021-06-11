use poker_solver::*;
use std::env;
use std::io::stdin;

fn print_info(ai: &AiPlayer) {
  println!(
    "剩下手牌为：\n{}\n{}",
    ai.get_challenger_remain(),
    ai.get_ai_remain()
  );
}

fn main() {
  let args: Vec<String> = env::args().collect();
  let (default_a, default_b) = (String::from("778899JQQQKKK2"), String::from("TTAA"));
  let (a, b) = if args.get(1) != None && args.get(2) != None {
    (&args[1], &args[2])
  } else {
    (&default_a, &default_b)
  };
  let mut ai = AiPlayer::new(a, b);

  if ai.winner == Winner::First {
    println!("先手胜，我执先手。");
    let s = ai.ai_play_default();
    if s.len() > 0 {
      println!("我出: {}", s);
    }
  } else {
    println!("后手胜，我执后手，你出牌吧");
  }
  print_info(&ai);
  loop {
    if ai.end {
      break;
    }
    let mut input = String::new();
    stdin().read_line(&mut input).expect("Failed to readln.");
    let output = ai.play(input);
    if output.len() == 0 {
      println!("我不出，你继续吧");
    } else if output == "UNKOWN".to_string() {
      println!("你出错了，不能这样出");
    } else {
      println!("我出: {}", output);
    }
    print_info(&ai);
  }
  println!("结束");
}
