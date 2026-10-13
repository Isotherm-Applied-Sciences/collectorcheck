export class CCError extends Error {
  constructor(code, msg, data = null) {
    super(msg);
    this.code = code;
    this.msg = msg;
    this.data = data;
  }

  toJSON() {
    const out = { error: this.code, msg: this.msg };
    if (this.data) out.data = this.data;
    return out;
  }
}

export function err(code, msg, data = null) {
  return new CCError(code, msg, data);
}