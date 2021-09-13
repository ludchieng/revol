class Entity {

  pos: p5.Vector;
  vel: p5.Vector = createVector(0, 0);
  acc: p5.Vector = createVector(0, 0);
  
  r: number;

  constructor(x: number, y: number, r = 8) {
    this.pos = createVector(x, y);
    this.r = r;
  }

  applyForce(force: p5.Vector) {
    this.acc.add(force);
  }

  intersects(e: Entity) {
    return (this.pos.dist(e.pos) < (this.r + e.r));
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.boundaries();
  }

  boundaries() {
    if (this.pos.x > width)
      this.pos.x -= 2 * width;
    if (this.pos.x < -width)
      this.pos.x += 2 * width;
    if (this.pos.y > height)
      this.pos.y -= 2 * height;
    if (this.pos.y < -height)
      this.pos.y += 2 * height;
  }
}
