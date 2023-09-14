export function nearestNumbers(index: number, first: number, last: number, quant: number): number[] {
  if (last - first < quant) return [];
  
  const arr = [];
  if (index > first && index < last) {
    arr.push(index);
    quant--;
  }
  let left: number | null = (index-1) < first ? null : (index-1);
  let right: number | null = (index+1) > last ? null : (index+1);

  while (quant > 0) {
    if (left) {
      if (left === first) left = null;
      else {
        arr.unshift(left);
        left--;
        quant--;
      }
    }
    if (right && quant > 0) {
      if (right === last) right = null;
      else {
        arr.push(right);
        right++;
        quant--;
      }
    }
  }

  return arr;
}
