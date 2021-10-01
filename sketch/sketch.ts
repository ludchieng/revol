//createSlider(1, 30, 15, 1).position(10, 10).style("width", "100px");
let entities: EntitiesList;
let qtree: QuadTree<Entity>;
let qtreeVisitor: QuadTreeVisitor<Entity>;
let view: View;
let chart: LineChart;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30).noFill().noStroke().rectMode(CENTER);

  view = new View(width/4, height/2, 0.89);
  entities = new EntitiesList();

  for (let i = 0; i < 60; i++) {
    const x = randomGaussian(0, width * 2);
    const y = randomGaussian(0, height * 2);
    const n = new Nutrient(x, y, random(50, 400), ceil(random(2, 20)))
    n.ageGrowPlants = 0;
    n.pGrowPlants = Infinity;
    entities.add(n);
  }

  for (let i = 0; i < 0; i++) {
    entities.add(new Worm(random(-width, width), random(-height, height)));
  }

  for (let i = 0; i < 0; i++) {
    entities.add(new Chicken(random(-width, width), random(-height, height)));
  }

  chart = new LineChart(950, 950, 1900, 1900);
}


function draw() {
  view.update();
  view.debug();
  
  background(0);

  quadtree();

  entities.update();
  entities.render();
  
  // Draw map boundaries
  push();
  stroke(255);
  strokeWeight(1);
  rect(0, 0, 1800, 1800);
  pop();

  // Update charts data
  if (frameCount % 2 === 0) {
    chart.add(entities.plants.length, 0)
    chart.add(entities.worms.length, 1)
    chart.add(entities.chickens.length, 2)
  }
  chart.render();
}


function quadtree() {
  const boundary = new Rectangle(0, 0, 900, 900);
  qtree = new QuadTree(boundary, 4);

  for (const e of entities.all()) {
    qtree.insert(new Point(e.pos.x, e.pos.y, e));
  }
}



function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function mouseWheel(e: {delta: number}) {
  view.zoom(e.delta);
}


function keyPressed() {
  if (key === 'a') {
    entities.add(new Worm(random(-width, width), random(-height, height)));
  }
  if (key === 'z') {
    entities.add(new Chicken(random(-width, width), random(-height, height)));
  }
  if (key === 'q') {
    entities.worms.splice(0, 1);
  }
  if (key === 's') {
    entities.chickens.splice(0, 1);
  }
}
