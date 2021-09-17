class Chicken extends Animal {

  static RADIUS = 16;
  
  static DEFAULT_GENES: GenesType = {
    maxHp: 16,
    lossHp: 2,
    breedHpFactor: 2,
    maxSpeed: 4,
    maxForceFactor: 0.25,
    eatWeight: 5,
    avoidWeight: -2,
    eatPerception: 120,
    avoidPerception: 80,
    ageNextDefecateMean: 80,
  };

  static randGenes(): GenesType {
    return {
      maxHp: 16,
      lossHp: random(1.8, 2.2),
      breedHpFactor: random(1.7, 2.3),
      maxSpeed: random(3.5, 4.5),
      maxForceFactor: random(0.2, 0.3),
      eatWeight: random(-1, 10),
      avoidWeight: random(-10, 1),
      eatPerception: random(80, 160),
      avoidPerception: random(60, 100),
      ageNextDefecateMean: random(60, 100),
    };
  }

  constructor(x: number, y: number, genes = Chicken.randGenes()) {
    genes = { ...Chicken.DEFAULT_GENES, ...genes };
    genes = {
      ...genes,
      maxHp: genes.maxHp,
      lossHp: genes.lossHp * random(0.9, 1.1),
      breedHpFactor: genes.breedHpFactor * random(0.9, 1.1),
      maxSpeed: genes.maxSpeed * random(0.9, 1.1),
      maxForceFactor: genes.maxForceFactor * random(0.9, 1.1),
      eatWeight: genes.eatWeight * random(0.8, 1.2),
      avoidWeight: genes.avoidWeight * random(0.9, 1.1),
      eatPerception: genes.eatPerception * random(0.8, 1.2),
      avoidPerception: genes.avoidPerception * random(0.9, 1.1),
      ageNextDefecateMean: genes.ageNextDefecateMean * random(0.98, 1.02),
    }
    super(x, y, Chicken.RADIUS, genes);
    this.vel = p5.Vector.random2D().mult(random(1.5, 2.5));
  }

  render() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading() + HALF_PI);
    fill(this.hp >= this.genes.breedHpFactor * this.genes.maxHp - Worm.DEFAULT_GENES.maxHp 
      ? color(0, 180, 255)
      : lerpColor(color(120, 20, 0), color(255, 20, 128), this.hp/this.genes.maxHp));
    beginShape();
    vertex(0, -this.r);
    vertex(-this.r, this.r);
    vertex(this.r, this.r);
    endShape(CLOSE);
    pop();

    // Eat perception
    if (keyIsDown && key === '1') {
      push();
      stroke(0, 255, 0);
      strokeWeight(1);
      noFill();
      circle(this.pos.x, this.pos.y, this.genes.eatPerception*2);
      pop();
    }
  }

  tryBreed() {
    if (this.hp < this.genes.breedHpFactor * this.genes.maxHp)
      return;
    const offspring = new Chicken(this.pos.x, this.pos.y, this.genes);
    offspring.hp = min(this.hp / 2, offspring.genes.maxHp);
    this.hp -= min(this.hp / 2, offspring.genes.maxHp);
    entities.add(offspring);
  }

  steerApproach() {
    const food = qtree.nearest(
      this.pos.x, this.pos.y,
      (e) => (e instanceof Worm),
      this.genes.eatPerception
    );

    if (!food)
      return createVector(0, 0);

    this.tryEat(food as Worm);

    return this.seek(food);
  }

  steerAvoid() {
    const nearest = qtree.nearest(
      this.pos.x, this.pos.y,
      (e) => (e instanceof Chicken),
      this.genes.avoidPerception
    );

    if (!nearest)
      return createVector(0, 0);

    return this.seek(nearest);
  }
}
