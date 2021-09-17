class EntitiesList {
  
  nutrients: Nutrient[] = [];
  plants: Plant[] = [];
  worms: Worm[] = [];
  chickens: Chicken[] = [];

  constructor() {}

  add(e: Entity) {
    if (e instanceof Nutrient) {
      const neighboors: Nutrient[] = (qtree)
      ? qtree.queryAll(
          new Circle(e.pos.x, e.pos.y, 40),
          (e: Entity) => (e instanceof Nutrient)
        ) as Nutrient[]
      : [];
      
      if (neighboors.length > 0) {
        // Agregate new nutrient with an existing one
        const receiver = neighboors[floor(random(neighboors.length))];
        receiver.nutrition += e.nutrition;
        receiver.r += e.nutrition * 10;
      } else {
        this.nutrients.push(e);
      }
    }
    if (e instanceof Plant)
      this.plants.push(e);
    if (e instanceof Worm)
      this.worms.push(e);
    if (e instanceof Chicken)
      this.chickens.push(e);
  }

  all() {
    return [
      ...this.nutrients,
      ...this.plants,
      ...this.worms,
      ...this.chickens,
    ];
  }

  updateLists() {
    for (let i = this.nutrients.length-1; i >= 0; i--) {
      if (this.nutrients[i].nutrition <= 0) {
        this.nutrients.splice(i, 1);
      }
    }
    
    for (let i = this.plants.length-1; i >= 0; i--) {
      if (this.plants[i].dead()) {
        this.plants.splice(i, 1);
      }
    }
    
    for (let i = this.worms.length-1; i >= 0; i--) {
      if (this.worms[i].dead()) {
        this.worms.splice(i, 1);
      }
    }
    
    for (let i = this.chickens.length-1; i >= 0; i--) {
      if (this.chickens[i].dead()) {
        this.chickens.splice(i, 1);
      }
    }
    
  }

  energySum() {
    return this.nutrients.reduce((acc, n) => acc + n.nutrition, 0)
      + this.plants.reduce((acc, p) => acc + p.hp, 0)
      + this.worms.reduce((acc, w) => acc + w.hp, 0)
      + this.chickens.reduce((acc, c) => acc + c.hp, 0)
  }
}
