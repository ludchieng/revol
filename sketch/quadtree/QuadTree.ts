// Based on Daniel Shiffman's excellent video series
// 1: https://www.youtube.com/watch?v=OJxEcs0w_kE
// 2: https://www.youtube.com/watch?v=QQx_NmCIuCY
// https://github.com/CodingTrain/QuadTree

class QuadTree<T> {
  
  parent: QuadTree<T>;
  boundary: Rectangle;
  capacity: number;
  points: Point<T>[] = [];
  divided = false;

  ne: QuadTree<T>;
  nw: QuadTree<T>;
  se: QuadTree<T>;
  sw: QuadTree<T>;

  visited = false;
  ignore = false;

  constructor(boundary: Rectangle, capacity: number, parent: QuadTree<T> = null) {
    if (!boundary)
      throw TypeError('boundary is null or undefined');

    if (!(boundary instanceof Rectangle))
      throw TypeError('boundary should be a Rectangle');

    if (typeof capacity !== 'number')
      throw TypeError(`capacity should be a number but is a ${typeof capacity}`);

    if (capacity < 1)
      throw RangeError('capacity must be greater than 0');
      
    this.boundary = boundary;
    this.capacity = capacity;
    this.parent = parent;
  }

  subdivide() {
    let x = this.boundary.x;
    let y = this.boundary.y;
    let w = this.boundary.w / 2;
    let h = this.boundary.h / 2;

    let ne = new Rectangle(x + w, y - h, w, h);
    let nw = new Rectangle(x - w, y - h, w, h);
    let se = new Rectangle(x + w, y + h, w, h);
    let sw = new Rectangle(x - w, y + h, w, h);
    this.ne = new QuadTree(ne, this.capacity, this);
    this.nw = new QuadTree(nw, this.capacity, this);
    this.se = new QuadTree(se, this.capacity, this);
    this.sw = new QuadTree(sw, this.capacity, this);

    this.divided = true;
  }

  prepareForVisit() {
    this.visited = false;
    this.ignore = false;

    for (const p of this.points) {
      p.scanned = false;
      p.selected = false;
    }

    if (this.divided) {
      for (const child of this.children())
        child.prepareForVisit();
    }
  }

  children() {
    return [this.nw, this.ne, this.sw, this.se];
  }

  insert(point: Point<T>): boolean {
    if (!this.boundary.contains(point))
      return false;

    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    }

    if (!this.divided)
      this.subdivide();

    if (this.ne.insert(point) || this.nw.insert(point)
     || this.se.insert(point) || this.sw.insert(point)
    ) {
      return true;
    }
  }

  nearest(
    x: number, y: number,
    filter?: (e?: T) => boolean,
    maxDist?: number
  ): T | null {
    const visitor = new QuadTreeVisitor(x, y, this, filter, maxDist);
    visitor.visit();
    return (visitor.best.p) ? visitor.best.p.data : null;
  }

  queryAll(
    range: Rectangle | Circle,
    filter = (e?: T) => true,
    found?: Point<T>[]
  ): T[] {
    if (!found)
      found = [];

    if (!range.intersects(this.boundary))
      return found.map((p) => p.data);

    for (let p of this.points)
      if (range.contains(p) && filter(p.data))
        found.push(p);
    
    if (this.divided) {
      for (const child of this.children())
        child.queryAll(range, filter, found);
    }

    return found.map((p) => p.data);
  }
  
  render() {
    if (this.divided) {
      for (const child of this.children())
        child.render();

    } else {
      push();
      stroke(255, 30);
      strokeWeight(3);
      if (this.visited) {
        strokeWeight(5);
        stroke(0, 255, 255)
      }
      if (this.ignore) {
        strokeWeight(2);
        stroke(255, 255, 0)
      }
      rectMode(CENTER);
      rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2);
      pop();
    }

    push();
    strokeWeight(1);
    stroke(255, 200);
    for (const p of this.points) {
      line(p.x-10, p.y, p.x+10, p.y)
      line(p.x, p.y-10, p.x, p.y+10)
    }
    pop();
  }

}
