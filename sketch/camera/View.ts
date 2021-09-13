class View {
  x: number;
  y: number;
  private scaleFactor: number;

  constructor(x: number, y: number, scale = 1) {
    this.x = x;
    this.y = y;
    this.scaleFactor = scale;
  }

  zoom(value: number) {
    this.scaleFactor += value / -5000;
  }

  scale(): number {
    return pow(this.scaleFactor, 6);
  }

  update() {
    translate(this.x, this.y);
    scale(this.scale());
    this.applyTransform();

    if (mouseIsPressed && mouseButton === CENTER) {
      this.x += movedX;
      this.y += movedY;
    }
  }

  applyTransform() {
  }

  debug() {
    push();
    stroke(255, 0, 255);
    rect(0, 0, width, height)
    pop();
  }
}