abstract class Animal extends Living {
  
  static DEFAULT_GENES: GenesType = {
    maxHp: 4,
    lossHp: 1,
    breedHpFactor: 2,
    maxSpeed: 2,
    maxForceFactor: 0.1,
    eatWeight: 2,
    avoidWeight: -2,
    ageNextDefecateMean: 80,
  };

  ageNextDefecate: number;

  constructor(x: number, y: number, r: number, genes: GenesType = {}) {
    genes = { ...Animal.DEFAULT_GENES, ...genes };
    super(x, y, r, genes);
    this.vel = p5.Vector.random2D().mult(random(1.5, 2.5));
    this.ageNextDefecate = this.age() + max(30, floor(randomGaussian(this.genes.ageNextDefecateMean, 30)));
  }
  

  private maxForce() {
    return this.genes.maxForceFactor * 1/this.genes.maxSpeed;
  }


  update() {
    super.update();
    this.tryBreed();
    this.tryDefecate();
    this.applyForce(this.steerApproach().mult(this.genes.eatWeight));
    this.applyForce(this.steerAvoid().mult(this.genes.avoidWeight));
  }


  render() {
    push();
    strokeWeight(1);
    stroke(255, 200);
      line(this.pos.x-10, this.pos.y-10, this.pos.x+10, this.pos.y+10)
      line(this.pos.x+10, this.pos.y+10, this.pos.x-10, this.pos.y-10)
    pop();
  }


  abstract tryBreed(): void;


  tryEat(target: Living) {
    if (this.pos.dist(target.pos) > this.r)
      return;
    this.hp += target.hp;
    target.hp = 0;
  }

  
  tryDefecate() {
    if (this.ageNextDefecate > this.age())
      return;

    this.ageNextDefecate = this.age() + max(30, floor(randomGaussian(this.genes.ageNextDefecateMean, 30)));
    entities.add(new Nutrient(
      this.pos.x, this.pos.y,
      this.r * random(5, 10), min(this.genes.lossHp, this.hp)
    ));
    this.hp -= min(this.genes.lossHp, this.hp);
    }

  abstract steerApproach(): p5.Vector;
  abstract steerAvoid(): p5.Vector;


  // Process force towards a target
  seek(target: Entity) {
    const desired = p5.Vector.sub(target.pos, this.pos)
      .setMag(this.genes.maxSpeed);

    const steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce());

    return steer;
  }
}
