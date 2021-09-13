class Worm extends Living {
  
  static DEFAULT_GENES: GenesType = {
    maxHp: 5,
    maxVel: 1.5,
    maxForceFactor: 0.1,
  };

  constructor(x: number, y: number, genes: GenesType = {}) {
    genes = {
      ...Worm.DEFAULT_GENES,
      ...genes,
      maxHp: Worm.DEFAULT_GENES.maxHp * random(0.95, 1.05),
      maxVel: Worm.DEFAULT_GENES.maxVel * random(0.95, 1.05),
      maxForceFactor: Worm.DEFAULT_GENES.maxForceFactor * random(0.95, 1.05),
    };
    super(x, y, Worm.RADIUS, genes);
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
    fill(lerpColor(color(50, 20, 10), color(50, 255, 60), this.hp/this.genes.maxHp));
    circle(this.pos.x, this.pos.y, this.r);
    pop();
  }

  steerEat() {
    let closest;
    //for
    // oskour http://ericandrewlewis.github.io/how-a-quadtree-works/
    return createVector(0, 0);
  }

  steerAvoid() {
    return createVector(0, 0);
  }
}