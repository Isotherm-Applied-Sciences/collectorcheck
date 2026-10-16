export function createViewModel(name, filter = {}, sort = {}) {
  return { name: String(name), filter, sort };
}