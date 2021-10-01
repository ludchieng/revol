class Nutrient extends Entity {

  static AGE_GROW_PLANTS_MEAN = 50;
  
  ageGrowPlants: number;
  pGrowPlants = 0.007;
  nutrition: number;

  constructor(
    x: number, y: number, r: number,
    nutrition: number
  ) {
    super(x, y, r);
    this.nutrition = nutrition;
    this.ageGrowPlants = Nutrient.AGE_GROW_PLANTS_MEAN * random(0.8, 1.4);
  }

  update() {
    super.update();
    this.tryGrowPlant();
  }

  tryGrowPlant() {
    if (this.age() < this.ageGrowPlants)
      return;
    
    if (random(1) < this.nutrition * this.pGrowPlants) {
      const plantMaxHp = min(this.nutrition, Plant.DEFAULT_GENES.maxHp);
      this.nutrition -= plantMaxHp;
      entities.add(new Plant(
        randomGaussian(this.pos.x, this.r*0.5),
        randomGaussian(this.pos.y, this.r*0.5),
        { maxHp: plantMaxHp }  
      ));
    }
  }

  render() {
    push();
    fill(lerpColor(color(32), color(50, 40, 25), this.nutrition/50));
    noStroke();
    circle(this.pos.x, this.pos.y, this.r);
    pop();
  }
}