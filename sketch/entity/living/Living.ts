type GenesType = { [idx: string]: number };

abstract class Living extends Entity {

  static RADIUS = 6;

  static DEFAULT_GENES: GenesType = {
    maxHp: 1,
    maxSpeed: 4,
    maxForceFactor: 0.1,
    eatWeight: 1,
    avoidWeight: -1,
    eatPerception: 20,
    avoidPerception: 20,
  };

  genes: GenesType;
  hp: number;

  birthFrame: number;

  constructor(
    x: number, y: number, r = Living.RADIUS,
    genes: GenesType,
  ) {
    genes = {
      ...Living.DEFAULT_GENES,
      ...genes,
    };
    super(x, y, r, genes.maxSpeed);
    this.genes = genes;
    this.hp = genes.maxHp;
    this.birthFrame = frameCount;
  }

  dead() {
    return this.hp <= 0;
  }

  update() {
    if (this.dead())
      return;
    this.applyForce(this.steerApproach().mult(this.genes.eatWeight));
    //this.applyForce(this.steerAvoid().mult(this.genes.avoidWeight));
    super.update();
  }

  abstract steerApproach(): p5.Vector
  abstract steerAvoid(): p5.Vector

  // Process force towards a target
  seek(target: Entity) {
    const desired = p5.Vector.sub(target.pos, this.pos)
      .setMag(this.genes.maxSpeed);

    const steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce());

    return steer;
  }

  private maxForce() {
    return this.genes.maxForceFactor * 1/this.genes.maxSpeed;
  }
}
