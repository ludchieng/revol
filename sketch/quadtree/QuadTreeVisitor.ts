type MatchPoint<T> = {
  dist: number,
  p: Point<T> | null,
};

class QuadTreeVisitor<T> {

  x: number;
  y: number;
  root: QuadTree<T>;
  currentNode: QuadTree<T>;
  best: MatchPoint<T>;
  filter: (e: T) => boolean; // condition that the element shoud satisfy

  constructor(
    x: number, y: number, qtree: QuadTree<T>,
    filter?: (e?: T) => boolean
  ) {
    this.x = x;
    this.y = y;
    this.root = qtree;
    this.currentNode = null;
    this.filter = filter || (() => true);
    this.best = { dist: qtree.boundary.w*2 + qtree.boundary.h*2, p: null };

    this.root.prepareForVisit();
  }

  visit() {
    do {
      this.visitNextNode();
    } while (this.currentNode !== this.root);
  }

  visitNextNode() {
    this.selectNextNode();
    const node = this.currentNode;
    const x = this.x;
    const y = this.y;
    const x1 = node.boundary.x1();
    const y1 = node.boundary.y1();
    const x2 = node.boundary.x2();
    const y2 = node.boundary.y2();
    node.visited = true;
    // exclude node if point is farther away than best distance in either axis
    if (x < x1 - this.best.dist || x > x2 + this.best.dist || y < y1 - this.best.dist || y > y2 + this.best.dist) {
        node.ignore = true;
        return;
    }
    // test point if there is one, potentially updating best
    for (const p of node.points) {
      if (p) {
        p.scanned = true;
        let dx = p.x - x, dy = p.y - y, distance = Math.sqrt(dx*dx + dy*dy);
        if (distance < this.best.dist && this.filter(p.data)) {
          this.best.dist = distance;

          if ( this.best.p && this.best.p.selected )
            this.best.p.selected = false;

          this.best.p = p;
          this.best.p.selected = true;
        }
      }
    }
  }

  selectNextNode() {
    // First time through, set the current node to root.
    if ( ! this.currentNode ) {
      this.currentNode = this.root;
      return;
    }
    const parent = this.currentNode;
    const children = this.currentNode.children();
  
    // given the subject position, find the child node that the coordinate would
    // fall into to. then recurse on this child first.
    const rl: any = (2*this.x > this.currentNode.boundary.x1() + this.currentNode.boundary.x2())
    const bt: any = (2 * this.y > this.currentNode.boundary.y1() + this.currentNode.boundary.y2());
  
    // If we're still interested in children...
    if ( ! this.currentNode.ignore ) {
      // Select a child to drill down into with priority to the one that contains
      // the subject. Don't visit if it's already been visited.
      if (children[bt*2+rl] && ! children[bt*2+rl].visited)  {
        this.currentNode = children[bt*2+rl];
      } else if (children[bt*2+(1-rl)] && ! children[bt*2+(1-rl)].visited) {
        this.currentNode = children[bt*2+(1-rl)];
      } else if (children[(1-bt)*2+rl] && ! children[(1-bt)*2+rl].visited) {
        this.currentNode = children[(1-bt)*2+rl];
      } else if (children[(1-bt)*2+(1-rl)] && ! children[(1-bt)*2+(1-rl)].visited ) {
        this.currentNode = children[(1-bt)*2+(1-rl)];
      } else {
        // If all children have been visited, we want to go to the next node,
        // or perhaps just set the current node up one in the tree and re-run this function.
        this.currentNode = this.currentNode.parent;
        this.selectNextNode();
        return;
      }
    } else {
      // If all children have been visited, we want to go to the next node,
      // or perhaps just set the current node up one in the tree and re-run this function.
      this.currentNode = this.currentNode.parent;
      this.selectNextNode();
      return;
    }
    this.currentNode.parent = parent;
  }

  render() {
    push();
    stroke(255, 0, 255, 200);
    strokeWeight(6);
    rectMode(CENTER);
    if (this.currentNode)
      rect(this.currentNode.boundary.x, this.currentNode.boundary.y, this.currentNode.boundary.w*2, this.currentNode.boundary.h*2);
    fill(255);
    if (this.best.p)
      circle(this.best.p.x, this.best.p.y, 20);
    pop();
  }
}
