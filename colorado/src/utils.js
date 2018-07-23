export function toBuffer(ab) {
  const buf = new Buffer(ab.byteLength);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}

export function toArrayBuffer(buf) {
  const ab = new ArrayBuffer(buf.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
}

export function getRange(data, dim, range) {
  const size = data.length / dim;

  for (let i = 0; i < size; i = i + 3) {
    for (let j = 0; j < dim; j++) {
      range[j].min = Math.min(range[j].min, data[i * dim + j]);
      range[j].max = Math.max(range[j].max, data[i * dim + j]);
    }
  }

  return range;
}
