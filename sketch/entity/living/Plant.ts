class Plant extends Living {

  static RADIUS = 8;

  static DEFAULT_GENES: GenesType = {
    maxHp: 1,
    maxSpeed: 0,
    maxForceFactor: 0,
    eatWeight: 0,
    avoidWeight: 0,
    eatPerception: 0,
    avoidPerception: 0,
  };

  constructor(x: number, y: number, genes: GenesType = {}) {
    genes = { ...Plant.DEFAULT_GENES, ...genes };
    genes = {
      ...genes,
    };
    super(x, y, Plant.RADIUS, genes);
    super.boundaries();
  }

  update() {}

  render() {
    push();
    fill(lerpColor(color(50, 20, 10), color(50, 255, 60), this.hp/this.genes.maxHp));
    circle(this.pos.x, this.pos.y, this.r);
    pop();
  }
  
  steerApproach() {
    return createVector(0, 0);
  }

  steerAvoid() {
    return createVector(0, 0);
  }
}
