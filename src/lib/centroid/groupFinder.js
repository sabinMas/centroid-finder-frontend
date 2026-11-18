// OWNED BY sabinMas-dev. See TASKS.md "sabinMas's tasks" before editing.
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
  const groups = [];

  for (let startIndex = 0; startIndex < binary.length; startIndex++) {
    if (binary[startIndex] !== 1 || visited[startIndex]) continue;

    visited[startIndex] = 1;
    const stack = [startIndex];
    let size = 0;
    let sumX = 0;
    let sumY = 0;

    while (stack.length > 0) {
      const index = stack.pop();
      const x = index % width;
      const y = Math.trunc(index / width);

      size++;
      sumX += x;
      sumY += y;

      const neighbors = [
        [x, y - 1], // up
        [x, y + 1], // down
        [x - 1, y], // left
        [x + 1, y], // right
      ];
      for (const [nx, ny] of neighbors) {
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const neighborIndex = ny * width + nx;
        if (binary[neighborIndex] === 1 && !visited[neighborIndex]) {
          visited[neighborIndex] = 1;
          stack.push(neighborIndex);
        }
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
