export function cloudResult(target, path, ok, data = null) {
  return {
    target,
    path,
    ok,
    data
  };
}

export function cloudError(code, msg, data = null) {
  return {
    error: code,
    msg,
    data
  };
}

export function validateCloudResult(obj) {
  if (!obj) return false;
  if (typeof obj.target !== 'string') return false;
  if (typeof obj.path !== 'string') return false;
  if (typeof obj.ok !== 'boolean') return false;
  return true;
}