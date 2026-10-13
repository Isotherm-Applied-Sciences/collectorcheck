export function apiResult(ok, data = null, error = null) {
  return { ok, data, error };
}

export function apiError(code, msg, data = null) {
  return { ok: false, error: { code, msg, data }, data: null };
}

export function validateApiResult(obj) {
  if (!obj) return false;
  if (typeof obj.ok !== 'boolean') return false;
  if (obj.ok && typeof obj.data !== 'object') return false;
  if (!obj.ok && (!obj.error || typeof obj.error.code !== 'string')) return false;
  return true;
}