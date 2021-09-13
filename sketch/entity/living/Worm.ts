class Worm extends Living {

  static RADIUS = 6;
  
  static DEFAULT_GENES: GenesType = {
    maxHp: 5,
    lossHp: 1,
    breedHpFactor: 2,
    maxSpeed: 3,
    maxForceFactor: 0.2,
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
      lossHp: genes.lossHp * random(0.9, 1.1),
      breedHpFactor: genes.breedHpFactor * random(0.9, 1.1),
      maxSpeed: genes.maxSpeed * random(0.95, 1.05),
      maxForceFactor: genes.maxForceFactor * random(0.95, 1.05),
      eatWeight: genes.eatWeight * random(0.9, 1.1),
      avoidWeight: genes.avoidWeight * random(0.9, 1.1),
      eatPerception: genes.eatPerception * random(0.9, 1.1),
      avoidPerception: genes.avoidPerception * random(0.9, 1.1),
    }
    super(x, y, Worm.RADIUS, genes);
    this.vel = p5.Vector.random2D().mult(random(1.5, 2.5));
  }

  update() {
    super.update();
    this.tryBreed();
    this.tryDefecate();
  }

  render() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading() + HALF_PI);
    fill(lerpColor(color(50, 20, 10), color(255, 200, 128), this.hp/this.genes.maxHp));
    rect(0, 0, this.r, this.r*5);
    pop();

    // Eat perception
    if (keyIsDown && key === '0') {
      push();
      stroke(0, 255, 0);
      strokeWeight(1);
      noFill();
      circle(this.pos.x, this.pos.y, this.genes.eatPerception*2);
      pop();
    }
/*
    if (this.target) {
      push();
      stroke(255, 0, 255);
      strokeWeight(2);
      noFill();
      circle(this.target.pos.x, this.target.pos.y, this.target.r + 10);
      pop();
    }*/
  }

  tryBreed() {
    if (this.hp < this.genes.breedHpFactor * this.genes.maxHp)
      return;
    this.hp /= 2;
    entities.add(new Worm(this.pos.x, this.pos.y, this.genes));
  }

  tryEat(p: Plant) {
    if (this.pos.dist(p.pos) > this.r)
      return;
    this.hp += p.hp;
    p.hp = 0;
  }

  tryDefecate() {
    if (random(1) > 0.01)
      return;
    this.hp -= this.genes.lossHp;
    entities.add(new Nutrient(
      this.pos.x, this.pos.y,
      this.r * random(15, 30), this.genes.lossHp
    ));
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
