// returns the centroid position for an array of points
export function getCentroid(polygon) {
  let sx = 0;
  let sy = 0;
  let sz = 0;

  // the last vertex is the same as the first, ignore
  const len = polygon.length - 1;
  for (let i = 0; i < len; i++) {
    const point = polygon[i];
    sx += point[0];
    sy += point[1];
    sz += point[2];
  }

  return [sx / len, sy / len, sz / len];
}
