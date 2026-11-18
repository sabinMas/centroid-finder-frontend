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
  // TODO(sabinMas-dev): DFS/BFS flood fill per unvisited 1-pixel, then sort descending.
  throw new Error('findConnectedGroups not implemented yet');
}
