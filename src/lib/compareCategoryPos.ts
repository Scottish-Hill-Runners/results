export function compareCategoryPos(a: CategoryPos, b: CategoryPos): number {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  const result =
    bKeys
    .filter(k => aKeys.includes(k))
    .reduce((v, k) => v + Math.sign(a[k] - b[k]), 0);
  return result == 0 ? bKeys.length - aKeys.length : result;
}
