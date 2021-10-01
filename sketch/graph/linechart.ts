type Dataset = {
  values: number[],
  color: string,
  scale: number,
}

class LineChart {

  static COLORS = [ '#5f5', '#fc8', '#f59' ]
  static SCALES = [ 2, 4, 4 ]

  pos: p5.Vector;
  size: p5.Vector;
  datasets: Dataset[] = [];

  constructor(x: number, y: number, sizeX = 600, sizeY = 400) {
    this.pos = createVector(x, y);
    this.size = createVector(sizeX, sizeY);
  }

  add(value: number, set = 0) {
    if (this.datasets[set] === undefined) {
      this.datasets[set] = {
        values: [],
        color: LineChart.COLORS[set],
        scale: LineChart.SCALES[set],
      }
    }
    if (this.datasets[set].values.length > this.size.y - 100) {
      for (const d of this.datasets) {
        d.values.splice(0, 1)
      }
    }

    this.datasets[set].values.push(value);
  }

  update() {
    
  }

  render() {
    const m = 50;
    push();
    translate(this.pos.x, this.pos.y);
    scale(1, -1);

    // Draw background
    push();
      fill(20, 200);
      rectMode(CORNER);
      rect(0, 0, this.size.x, this.size.y);
    pop();


    // Plot axis
    push();
    stroke(200);
    strokeWeight(1);
    translate(m, m);
    line(0, 0, 0, this.size.y - m*2);
    line(0, 0, this.size.x - m*2, 0);
    pop();

    // Plot lines
    push();
    stroke(255);
    strokeWeight(3);
    translate(m, m);
    for (const set of this.datasets) {
      push();
      beginShape();
      stroke(set.color);
      for (let j = 0; j < set.values.length; ++j) {
        vertex(j, set.values[j] * set.scale)
      }
      endShape();
      pop();
    }
    pop();

    pop();
  }

}
