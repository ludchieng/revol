class Entity {

  pos: p5.Vector;
  vel: p5.Vector = createVector(0, 0);
  acc: p5.Vector = createVector(0, 0);

  maxSpeed: number = Infinity;
  r: number;

  birthFrame: number;

  constructor(x: number, y: number, r = 8, maxSpeed?: number) {
    this.pos = createVector(x, y);
    this.maxSpeed = maxSpeed;
    this.r = r;
    this.birthFrame = frameCount;
  }

  age() {
    return frameCount - this.birthFrame;
  }

  applyForce(force: p5.Vector) {
    this.acc.add(force);
  }

  intersects(e: Entity) {
    return (this.pos.dist(e.pos) < (this.r + e.r));
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.boundaries();
  }

  boundaries() {
    if (this.pos.x > qtree.boundary.w)
      this.pos.x -= 2 * qtree.boundary.w;
    if (this.pos.x < -qtree.boundary.w)
      this.pos.x += 2 * qtree.boundary.w;
    if (this.pos.y > qtree.boundary.h)
      this.pos.y -= 2 * qtree.boundary.h;
    if (this.pos.y < -qtree.boundary.h)
      this.pos.y += 2 * qtree.boundary.h;
  }
}
