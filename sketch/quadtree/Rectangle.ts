// Based on Daniel Shiffman's excellent video series
// 1: https://www.youtube.com/watch?v=OJxEcs0w_kE
// 2: https://www.youtube.com/watch?v=QQx_NmCIuCY
// https://github.com/CodingTrain/QuadTree

class Rectangle {
  x: number;
  y: number; 
  w: number; 
  h: number; 

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  contains(point: Point) {
    return (point.x >= this.x - this.w &&
      point.x <= this.x + this.w &&
      point.y >= this.y - this.h &&
      point.y <= this.y + this.h);
  }

  intersects(range: Rectangle) {
    return !(range.x - range.w > this.x + this.w ||
      range.x + range.w < this.x - this.w ||
      range.y - range.h > this.y + this.h ||
      range.y + range.h < this.y - this.h);
  }

  x1() { return this.x - this.w }
  x2() { return this.x + this.w }
  y1() { return this.y - this.w }
  y2() { return this.y + this.h }
}
