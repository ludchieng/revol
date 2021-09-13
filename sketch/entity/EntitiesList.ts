class EntitiesList {
  
  nutrients: Nutrient[] = [];
  plants: Plant[] = [];
  worms: Worm[] = [];

  constructor() {}

  add(e: Entity) {
    if (e instanceof Nutrient)
      this.nutrients.push(e);
    if (e instanceof Plant)
      this.plants.push(e);
    if (e instanceof Worm)
      this.worms.push(e);
  }

  all() {
    return [
      ...this.nutrients,
      ...this.plants,
      ...this.worms,
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
    
  }
}
