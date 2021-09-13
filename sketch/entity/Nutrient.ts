class Nutrient extends Entity {
  
  nutrition: number;

  constructor(
    x: number, y: number, r: number,
    nutrition: number
  ) {
    super(x, y, r);
    this.nutrition = nutrition;
  }

  update() {
    super.update();
    // Spawn plants
    if (this.nutrition > 0 && random(1) < 0.2) {
      let p = new Plant(
        randomGaussian(this.pos.x, this.r*0.5),
        randomGaussian(this.pos.y, this.r*0.5));
      this.nutrition -= p.genes.maxHp;
      entities.add(p);
    }
  }

  render() {
    push();
    fill(lerpColor(color(25), color(50, 40, 25), this.nutrition/50));
    noStroke();
    circle(this.pos.x, this.pos.y, this.r);
    pop();
  }
}