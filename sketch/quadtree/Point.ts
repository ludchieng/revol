// Based on Daniel Shiffman's excellent video series
// 1: https://www.youtube.com/watch?v=OJxEcs0w_kE
// 2: https://www.youtube.com/watch?v=QQx_NmCIuCY
// https://github.com/CodingTrain/QuadTree

class Point<T> {

  x: number;
  y: number;
  scanned = false;
  selected = false;
  data: T;

  constructor(x: number, y: number, data: T) {
    this.x = x;
    this.y = y;
    this.data = data;
  }
}
