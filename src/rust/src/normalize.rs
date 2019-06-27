use crate::level::*;

pub fn normalize(s1: &str, s2: &str) -> (Vec<(u32, u32)>, Vec<(u32, u32)>) {
    let s = s1.to_string() + s2;
    let mut max = 0u32;
    let mut levels = {
        let mut v = Vec::new();
        for c in s.chars() {
            let lvl = get_level(&c);
            if lvl > max {
                max = lvl
            }
            v.push(lvl)
        }
        v
    };
    let mut record = vec![false; (max + 1) as usize];
    for lvl in &levels {
        record[*lvl as usize] = true;
    }
    let mut level = 0;
    for n in &record {
        if !n {
            for c in &mut levels {
                if *c > level {
                    *c -= 1;
                }
            }
        } else {
            level += 1;
        }
    }
    let mut r1: Vec<(u32, u32)> = vec![];
    let mut r2: Vec<(u32, u32)> = vec![];
    for i in 0..s1.len() {
        let lvl = levels[i];
        let len = r1.len();
        if len == 0 || r1[len - 1].0 != lvl {
            r1.push((lvl, 1))
        } else {
            r1[len - 1].1 += 1;
        }
    }
    for i in 0..s2.len() {
        let lvl = levels[i + s1.len()];
        let len = r2.len();
        if len == 0 || r2[len - 1].0 != lvl {
            r2.push((lvl, 1))
        } else {
            r2[len - 1].1 += 1;
        }
    }
    (r1, r2)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn normal() {
        assert_eq!(
            normalize("778899JQQQKKK2", "TTAA"),
            (
                vec![(0, 2), (1, 2), (2, 2), (4, 1), (5, 3), (6, 3), (8, 1)],
                vec![(3, 2), (7, 2)]
            )
        );
    }

    #[test]
    fn with_empty() {
        assert_eq!(
            normalize("7799TT", "TTAA"),
            (vec![(0, 2), (1, 2), (2, 2)], vec![(2, 2), (3, 2)])
        )
    }
}
