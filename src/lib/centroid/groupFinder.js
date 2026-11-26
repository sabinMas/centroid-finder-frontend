// Port of DfsBinaryGroupFinder.java + Group.java's centroid/sort logic.

/**
 * Finds connected groups of 1s in a flat binary array representing a width x height
 * image, matching DfsBinaryGroupFinder.findConnectedGroups: pixels are connected
 * vertically/horizontally (not diagonally), each group's centroid is the integer-divided
 * average of its pixel coordinates, and groups are sorted descending by size (ties broken
 * by centroid x, then y - see Group.java's compareTo).
 *
 * @param {Uint8Array} binary - length width*height, one 0/1 entry per pixel
 * @param {number} width
 * @param {number} height
 * @returns {Array<{size: number, centroidX: number, centroidY: number}>} groups, largest first
 */
export function findConnectedGroups(binary, width, height) {
  const visited = new Uint8Array(width * height);
  // Every pixel is pushed at most once (it is marked visited when pushed), so one
  // preallocated stack the size of the image is always big enough and is reused by every group.
  const stack = new Int32Array(width * height);
  const groups = [];

  for (let startIndex = 0; startIndex < binary.length; startIndex++) {
    if (binary[startIndex] !== 1 || visited[startIndex]) continue;

    visited[startIndex] = 1;
    let stackSize = 0;
    stack[stackSize++] = startIndex;
    let size = 0;
    let sumX = 0;
    let sumY = 0;

    while (stackSize > 0) {
      const index = stack[--stackSize];
      const y = Math.trunc(index / width);
      const x = index - y * width;

      size++;
      sumX += x;
      sumY += y;

      // Up, down, left, right. Each neighbor is checked in place instead of building an
      // array of coordinate pairs per pixel.
      if (y > 0 && binary[index - width] === 1 && !visited[index - width]) {
        visited[index - width] = 1;
        stack[stackSize++] = index - width;
      }
      if (y < height - 1 && binary[index + width] === 1 && !visited[index + width]) {
        visited[index + width] = 1;
        stack[stackSize++] = index + width;
      }
      if (x > 0 && binary[index - 1] === 1 && !visited[index - 1]) {
        visited[index - 1] = 1;
        stack[stackSize++] = index - 1;
      }
      if (x < width - 1 && binary[index + 1] === 1 && !visited[index + 1]) {
        visited[index + 1] = 1;
        stack[stackSize++] = index + 1;
      }
    }

    groups.push({
      size,
      centroidX: Math.trunc(sumX / size),
      centroidY: Math.trunc(sumY / size),
    });
  }

  groups.sort((a, b) => {
    if (b.size !== a.size) return b.size - a.size;
    if (b.centroidX !== a.centroidX) return b.centroidX - a.centroidX;
    return b.centroidY - a.centroidY;
  });

  return groups;
}
