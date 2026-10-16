export function createTagModel(name, count = 0) {
  return { name: String(name), count: Number(count) || 0 };
}