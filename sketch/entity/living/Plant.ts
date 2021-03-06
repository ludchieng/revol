class Plant extends Living {

  static RADIUS = 8;

  static DEFAULT_GENES: GenesType = {
    maxHp: 1,
  };

  static randGenes(): GenesType {
    return {
      maxHp: 1,
    };
  }

  constructor(x: number, y: number, genes = Plant.randGenes()) {
    genes = { ...Plant.DEFAULT_GENES, ...genes };
    genes = {
      ...genes,
    };
    super(x, y, Plant.RADIUS, genes);
  }

  update() {
    super.boundaries();
  }

  render() {
    push();
    fill(lerpColor(color(50, 20, 10), color(50, 255, 60), this.hp/this.genes.maxHp));
    circle(this.pos.x, this.pos.y, this.r);
    pop();
  }
}
