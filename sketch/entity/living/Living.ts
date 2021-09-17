type GenesType = { [idx: string]: number };

abstract class Living extends Entity {

  static RADIUS = 6;

  static DEFAULT_GENES: GenesType = {
    maxHp: 1,
  };

  genes: GenesType;
  hp: number;

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
  }

  dead() {
    return this.hp <= 0;
  }

  update() {
    if (this.dead())
      return;
    super.update();
  }
}
