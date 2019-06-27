pub fn delete_index<T: Copy>(vec: &Vec<T>, index: usize, item: Option<T>) -> Vec<T> {
    let mut result: Vec<T> = vec![];
    for (i, j) in vec.iter().enumerate() {
        if i != index {
            result.push(j.clone());
        } else if let Some(val) = item {
            result.push(val.clone());
        }
    }
    result
}

pub fn delete_item<T: std::cmp::PartialEq + Copy>(vec: &Vec<T>, item: T) -> Vec<T> {
    vec.clone()
        .iter()
        .filter(|&k| *k != item)
        .map(|&k| k)
        .collect()
}
