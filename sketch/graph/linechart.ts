class LineChart {

  pos: p5.Vector;
  size: p5.Vector;
  labels: string[] = [];
  values: number[] = [];

  constructor(x: number, y: number, sizeX = 600, sizeY = 400) {
    this.pos = createVector(x, y);
    this.size = createVector(sizeX, sizeY);
  }

  add(value: number, label = "") {
    this.labels.push(label);
    this.values.push(value);
  }

  update() {
    
  }

  render() {
    const m = 50;
    push();
    translate(this.pos.x, this.pos.y);
    scale(1, -1);

    push();
      fill(20, 200);
      rectMode(CORNER);
      rect(0, 0, this.size.x, this.size.y);
    pop();

    stroke(255);

    translate(m, m);
    line(0, 0, 0, this.size.y - m*2);
    line(0, 0, this.size.x - m*2, 0);

    scale( 30, (this.size.y - m*2) )

    pop();
  }

}
