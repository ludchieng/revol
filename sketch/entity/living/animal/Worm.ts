class Worm extends Animal {

  static RADIUS = 6;
  
  static DEFAULT_GENES: GenesType = {
    maxHp: 3,
    lossHp: 1,
    breedHpFactor: 2,
    maxSpeed: 3,
    maxForceFactor: 0.3,
    eatWeight: 2,
    avoidWeight: -5,
    eatPerception: 80,
    avoidPerception: 200,
    ageNextDefecateMean: 100,
  };

  static randGenes(): GenesType {
    return {
      maxHp: 3,
      lossHp: random(0.8, 1.2),
      breedHpFactor: random(1.7, 2.3),
      maxSpeed: random(2.5, 4.5),
      maxForceFactor: random(0.2, 0.4),
      eatWeight: random(-1, 5),
      avoidWeight: random(-5, 1),
      eatPerception: random(60, 200),
      avoidPerception: random(60, 200),
      ageNextDefecateMean: random(80, 120),
    };
  }

  constructor(x: number, y: number, genes = Worm.randGenes()) {
    genes = { ...Worm.DEFAULT_GENES, ...genes };
    genes = {
      ...genes,
      maxHp: genes.maxHp,
      lossHp: genes.lossHp * random(0.9, 1.1),
      breedHpFactor: genes.breedHpFactor * random(0.9, 1.1),
      maxSpeed: genes.maxSpeed * random(0.95, 1.05),
      maxForceFactor: genes.maxForceFactor * random(0.95, 1.05),
      eatWeight: genes.eatWeight * random(0.9, 1.1),
      avoidWeight: genes.avoidWeight * random(0.9, 1.1),
      eatPerception: genes.eatPerception * random(0.9, 1.1),
      avoidPerception: genes.avoidPerception * random(0.9, 1.1),
      ageNextDefecateMean: genes.ageNextDefecateMean * random(0.98, 1.02),
    }
    super(x, y, Worm.RADIUS, genes);
    this.vel = p5.Vector.random2D().mult(random(1.5, 2.5));
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
  }

  tryBreed() {
    if (this.hp < this.genes.breedHpFactor * this.genes.maxHp)
      return;
    const offspring = new Worm(this.pos.x, this.pos.y, this.genes);
    offspring.hp = min(this.hp / 2, offspring.genes.maxHp);
    this.hp -= min(this.hp / 2, offspring.genes.maxHp);
    entities.add(offspring);
  }

  steerApproach() {
    const food = qtree.nearest(
      this.pos.x, this.pos.y,
      (e) => (e instanceof Plant),
      this.genes.eatPerception
    );

    if (!food)
      return createVector(0, 0);

    this.tryEat(food as Plant);

    return this.seek(food);
  }

  steerAvoid() {
    const nearestChicken = qtree.nearest(
      this.pos.x, this.pos.y,
      (e) => (e !== this && e instanceof Chicken),
      this.genes.avoidPerception
    );
    
    const nearestWorm = qtree.nearest(
      this.pos.x, this.pos.y,
      (e) => (e !== this && e instanceof Worm),
      this.genes.avoidPerception
    );

    let force = createVector(0, 0);

    if (nearestChicken)
      force = force.add(this.seek(nearestChicken));
    if (nearestWorm)
      force = force.add(this.seek(nearestWorm));
/*
    push()
    stroke(255, 20, 20)
    strokeWeight(2)
    translate(this.pos.x, this.pos.y)
    line(0, 0, force.x * 300 * this.genes.avoidWeight, force.y * 300 * this.genes.avoidWeight)
    pop()*/
    return force;
  }
}
