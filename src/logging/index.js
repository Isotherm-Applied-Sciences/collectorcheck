export function logInfo(msg, data = null) {
  const out = { level: 'info', msg };
  if (data) out.data = data;
  console.log(JSON.stringify(out));
}

export function logError(msg, data = null) {
  const out = { level: 'error', msg };
  if (data) out.data = data;
  console.error(JSON.stringify(out));
}