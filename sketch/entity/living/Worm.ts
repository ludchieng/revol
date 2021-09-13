class Worm extends Living {

  static RADIUS = 4;
  
  static DEFAULT_GENES: GenesType = {
    maxHp: 5,
    maxSpeed: 2,
    maxForceFactor: 0.1,
    eatWeight: 2,
    avoidWeight: -2,
    eatPerception: 80,
    avoidPerception: 80,
  };

  //TODO remove
  target: Entity;

  constructor(x: number, y: number, genes: GenesType = {}) {
    genes = { ...Worm.DEFAULT_GENES, ...genes };
    genes = {
      ...genes,
      maxHp: genes.maxHp * random(0.95, 1.05),
      maxSpeed: genes.maxSpeed * random(0.95, 1.05),
      maxForceFactor: genes.maxForceFactor * random(0.95, 1.05),
    }
    super(x, y, Worm.RADIUS, genes);
    this.vel = p5.Vector.random2D().mult(random(1.5, 2.5));
  }

  clone() {
    entities.add(new Worm(
      this.pos.x + random(-this.genes.breedDist, this.genes.breedDist),
      this.pos.y + random(-this.genes.breedDist, this.genes.breedDist),
      this.genes));
  }

  update() {
    super.update();
    const age = frameCount - this.birthFrame;
    if (age > this.genes.matureAge && random(1) < 0.1) {
      this.clone();
    }
  }

  render() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading() + HALF_PI);
    fill(lerpColor(color(50, 20, 10), color(255, 200, 128), this.hp/this.genes.maxHp));
    rect(0, 0, this.r, this.r*4);
    pop();

    // Eat perception
    push();
    stroke(0, 255, 0);
    strokeWeight(1);
    noFill();
    circle(this.pos.x, this.pos.y, this.genes.eatPerception*2);
    pop();

    if (this.target) {
      push();
      stroke(255, 0, 255);
      strokeWeight(2);
      noFill();
      circle(this.target.pos.x, this.target.pos.y, this.target.r + 10);
      pop();
    }
  }

  tryEat(p: Plant) {
    if (this.pos.dist(p.pos) > this.r)
      return;
    this.hp += p.hp;
    p.hp = 0;
  }

  steerApproach() {
    const food = qtree.nearest(
      this.pos.x, this.pos.y,
      (e) => (e instanceof Plant),
      this.genes.eatPerception
    );

    this.target = food;

    if (!food)
      return createVector(0, 0);

    this.tryEat(food as Plant);

    return this.seek(food);
  }

  steerAvoid() {
    const nearest = qtree.nearest(
      this.pos.x, this.pos.y,
      (e) => (e instanceof Worm),
      this.genes.avoidPerception
    );

    if (!nearest)
      return createVector(0, 0);

    return this.seek(nearest);
  }
}
