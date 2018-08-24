export function quaternionToEuler({w, x, y, z}) {
  const ysqr = y * y;
  const t0 = -2.0 * (ysqr + z * z) + 1.0;
  const t1 = +2.0 * (x * y + w * z);
  let t2 = -2.0 * (x * z - w * y);
  const t3 = +2.0 * (y * z + w * x);
  const t4 = -2.0 * (x * x + ysqr) + 1.0;

  t2 = t2 > 1.0 ? 1.0 : t2;
  t2 = t2 < -1.0 ? -1.0 : t2;

  const ans = {};
  ans.pitch = Math.asin(t2);
  ans.roll = Math.atan2(t3, t4);
  ans.yaw = Math.atan2(t1, t0);

  return ans;
}
