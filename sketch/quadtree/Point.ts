// Based on Daniel Shiffman's excellent video series
// 1: https://www.youtube.com/watch?v=OJxEcs0w_kE
// 2: https://www.youtube.com/watch?v=QQx_NmCIuCY
// https://github.com/CodingTrain/QuadTree

class Point {

  x: number;
  y: number;
  scanned = false;
  selected = false;
  data: any;

  constructor(x: number, y: number, data: any) {
    this.x = x;
    this.y = y;
    this.data = data;
  }
}
