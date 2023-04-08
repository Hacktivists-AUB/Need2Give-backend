/* eslint-disable import/prefer-default-export */
function getRandom<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)];
}

export { getRandom };
