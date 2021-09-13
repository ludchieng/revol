//createSlider(1, 30, 15, 1).position(10, 10).style("width", "100px");
let entities: EntitiesList;
let qtree: QuadTree<Entity>;
let qtreeVisitor: QuadTreeVisitor<Entity>;
let view: View;

let mousepoint: p5.Vector;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60).noFill().noStroke().rectMode(CENTER);

  view = new View(width/2, height/2, 0.89);
  entities = new EntitiesList();

  for (let i = 0; i < 50; i++) {
    const x = randomGaussian(0, width * 2);
    const y = randomGaussian(0, height * 2);
    entities.add(new Nutrient(x, y, random(50, 400), random(2, 20)));
  }

  for (let i = 0; i < 1; i++) {
    entities.add(new Worm(random(-width, width), random(-height, height)));
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function mouseWheel(e: {delta: number}) {
  view.zoom(e.delta);
}


function draw() {
  view.update();
  view.debug();
  
  background(0);

  quadtree();
  
  for (const e of entities.all()) {
    e.update();
    e.render();
  }
  qtree && qtree.render();
  qtreeVisitor && qtreeVisitor.render();

  if (mousepoint) {
    push();
    fill(255, 50, 50);
    noStroke();
    circle(mousepoint.x, mousepoint.y, 16)
    pop();
  }

  entities.updateLists();

  for (let e of entities.all()) {
    const range = new Circle(e.pos.x, e.pos.y, e.r);
    const matches = qtree.queryAll(range, (e) => (e instanceof Nutrient));
    for (let m of matches) {
      if (e !== m && e.intersects(m)) {
        push();
        stroke(255);
        strokeWeight(1);
        //circle(e.pos.x, e.pos.y, e.r+10);
        pop();
      }
    }
  }
}


function quadtree() {
  const boundary = new Rectangle(0, 0, max(width, height), max(width, height));
  qtree = new QuadTree(boundary, 4);

  for (const e of entities.all()) {
    qtree.insert(new Point(e.pos.x, e.pos.y, e));
  }
}
