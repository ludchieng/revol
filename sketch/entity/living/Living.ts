type GenesType = { [idx: string]: number };

abstract class Living extends Entity {

  static RADIUS = 6;

  static DEFAULT_GENES: GenesType = {
    maxHp: 1,
    maxVel: 1.5,
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
    super(x, y, r);
    this.genes = {
      ...Living.DEFAULT_GENES,
      ...genes,
    };
    this.hp = genes.maxHp;
    this.birthFrame = frameCount;
  }

  dead() {
    return this.hp <= 0;
  }

  update() {
    if (this.dead())
      return;
    super.update();

    this.applyForce(this.steerEat().mult(this.genes.eatWeight));
    this.applyForce(this.steerAvoid().mult(this.genes.avoidWeight));
  }

  abstract steerEat(): p5.Vector
  abstract steerAvoid(): p5.Vector

  // Process force towards a target
  seek(target: Entity) {
    const desired = p5.Vector.sub(target.pos, this.pos)
      .setMag(this.genes.maxVel);

    const steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxforce());

    return steer;
  }

  private maxforce() {
    return this.genes.maxforceFactor * 1/this.genes.maxVel;
  }
}
