var entities;
var qtree;
var qtreeVisitor;
var view;
var mousepoint;
function setup() {
    createCanvas(windowWidth, windowHeight);
    noFill().frameRate(60);
    view = new View(width / 2, height / 2, 0.89);
    entities = new EntitiesList();
    for (var i = 0; i < 50; i++) {
        var x = randomGaussian(0, width * 2);
        var y = randomGaussian(0, height * 2);
        entities.add(new Nutrient(x, y, random(50, 400), random(30, 50)));
    }
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
function mouseWheel(e) {
    view.zoom(e.delta);
}
function mousePressed() {
    if (mouseButton === LEFT) {
        quadtree();
        mousepoint = createVector(mouseX - view.x, mouseY - view.y).div(view.scale());
        qtreeVisitor = new QuadTreeVisitor(mousepoint.x, mousepoint.y, { dist: width + height, p: null }, qtree);
        qtreeVisitor.visitNextNode();
    }
    else {
        qtreeVisitor.visitNextNode();
    }
}
function draw() {
    view.update();
    view.debug();
    background(0);
    for (var _i = 0, _a = entities.all(); _i < _a.length; _i++) {
        var e = _a[_i];
        e.update();
        e.render();
    }
    qtree && qtree.render();
    qtreeVisitor && qtreeVisitor.render();
    if (mousepoint) {
        push();
        fill(255, 50, 50);
        noStroke();
        circle(mousepoint.x, mousepoint.y, 16);
        pop();
    }
    entities.updateLists();
}
function quadtree() {
    var boundary = new Rectangle(0, 0, width, height);
    qtree = new QuadTree(boundary, 4);
    for (var _i = 0, _a = entities.all(); _i < _a.length; _i++) {
        var e = _a[_i];
        qtree.insert(new Point(e.pos.x, e.pos.y, e));
    }
}
var View = (function () {
    function View(x, y, scale) {
        if (scale === void 0) { scale = 1; }
        this.x = x;
        this.y = y;
        this.scaleFactor = scale;
    }
    View.prototype.zoom = function (value) {
        this.scaleFactor += value / -5000;
    };
    View.prototype.scale = function () {
        return pow(this.scaleFactor, 6);
    };
    View.prototype.update = function () {
        translate(this.x, this.y);
        scale(this.scale());
        this.applyTransform();
        if (mouseIsPressed && mouseButton === RIGHT) {
            this.x += movedX;
            this.y += movedY;
        }
    };
    View.prototype.applyTransform = function () {
    };
    View.prototype.debug = function () {
        push();
        stroke(255, 0, 255);
        rect(0, 0, width, height);
        pop();
    };
    return View;
}());
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var EntitiesList = (function () {
    function EntitiesList() {
        this.nutrients = [];
        this.plants = [];
    }
    EntitiesList.prototype.add = function (e) {
        if (e instanceof Nutrient)
            this.nutrients.push(e);
        if (e instanceof Plant)
            this.plants.push(e);
    };
    EntitiesList.prototype.all = function () {
        return __spreadArrays(this.nutrients, this.plants);
    };
    EntitiesList.prototype.updateLists = function () {
        for (var i = this.nutrients.length - 1; i >= 0; i--) {
            if (this.nutrients[i].nutrition <= 0) {
                this.nutrients.splice(i, 1);
            }
        }
        for (var i = this.plants.length - 1; i >= 0; i--) {
            if (this.plants[i].dead()) {
                this.plants.splice(i, 1);
            }
        }
    };
    return EntitiesList;
}());
var Entity = (function () {
    function Entity(x, y, r) {
        if (r === void 0) { r = 8; }
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.pos = createVector(x, y);
        this.r = r;
    }
    Entity.prototype.applyForce = function (force) {
        this.acc.add(force);
    };
    Entity.prototype.intersects = function (e) {
        return (this.pos.dist(e.pos) < (this.r + e.r));
    };
    Entity.prototype.update = function () {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.boundaries();
    };
    Entity.prototype.boundaries = function () {
        if (this.pos.x > width)
            this.pos.x -= 2 * width;
        if (this.pos.x < -width)
            this.pos.x += 2 * width;
        if (this.pos.y > height)
            this.pos.y -= 2 * height;
        if (this.pos.y < -height)
            this.pos.y += 2 * height;
    };
    return Entity;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Nutrient = (function (_super) {
    __extends(Nutrient, _super);
    function Nutrient(x, y, r, nutrition) {
        var _this = _super.call(this, x, y, r) || this;
        _this.nutrition = nutrition;
        return _this;
    }
    Nutrient.prototype.update = function () {
        _super.prototype.update.call(this);
        if (this.nutrition > 0 && random(1) < 0.2) {
            var p = new Plant(randomGaussian(this.pos.x, this.r * 0.5), randomGaussian(this.pos.y, this.r * 0.5));
            this.nutrition -= p.genes.maxHp;
            entities.add(p);
        }
    };
    Nutrient.prototype.render = function () {
        push();
        fill(lerpColor(color(25), color(50, 40, 25), this.nutrition / 50));
        noStroke();
        circle(this.pos.x, this.pos.y, this.r);
        pop();
    };
    return Nutrient;
}(Entity));
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var Living = (function (_super) {
    __extends(Living, _super);
    function Living(x, y, r, genes) {
        if (r === void 0) { r = Living.RADIUS; }
        var _this = _super.call(this, x, y, r) || this;
        _this.genes = __assign(__assign({}, Living.DEFAULT_GENES), genes);
        _this.hp = genes.maxHp;
        _this.birthFrame = frameCount;
        return _this;
    }
    Living.prototype.dead = function () {
        return this.hp <= 0;
    };
    Living.prototype.update = function () {
        if (this.dead())
            return;
        _super.prototype.update.call(this);
        this.applyForce(this.steerEat().mult(this.genes.eatWeight));
        this.applyForce(this.steerAvoid().mult(this.genes.avoidWeight));
    };
    Living.prototype.seek = function (target) {
        var desired = p5.Vector.sub(target.pos, this.pos)
            .setMag(this.genes.maxVel);
        var steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxforce());
        return steer;
    };
    Living.prototype.maxforce = function () {
        return this.genes.maxforceFactor * 1 / this.genes.maxVel;
    };
    Living.RADIUS = 6;
    Living.DEFAULT_GENES = {
        maxHp: 1,
        maxVel: 1.5,
        maxForceFactor: 0.1,
        eatWeight: 1,
        avoidWeight: -1,
        eatPerception: 20,
        avoidPerception: 20,
    };
    return Living;
}(Entity));
var Plant = (function (_super) {
    __extends(Plant, _super);
    function Plant(x, y, genes) {
        if (genes === void 0) { genes = {}; }
        var _this = this;
        genes = __assign(__assign(__assign({}, Plant.DEFAULT_GENES), genes), { maxHp: Plant.DEFAULT_GENES.maxHp * random(0.9, 1.1) });
        _this = _super.call(this, x, y, Plant.RADIUS, genes) || this;
        _super.prototype.boundaries.call(_this);
        return _this;
    }
    Plant.prototype.update = function () { };
    Plant.prototype.render = function () {
        push();
        fill(lerpColor(color(50, 20, 10), color(50, 255, 60), this.hp / this.genes.maxHp));
        circle(this.pos.x, this.pos.y, this.r);
        pop();
    };
    Plant.prototype.steerEat = function () {
        return createVector(0, 0);
    };
    Plant.prototype.steerAvoid = function () {
        return createVector(0, 0);
    };
    Plant.RADIUS = 8;
    Plant.DEFAULT_GENES = {
        maxHp: 1,
        maxVel: 0,
        maxForceFactor: 0,
        eatWeight: 0,
        avoidWeight: 0,
        eatPerception: 0,
        avoidPerception: 0,
    };
    return Plant;
}(Living));
var Worm = (function (_super) {
    __extends(Worm, _super);
    function Worm(x, y, genes) {
        if (genes === void 0) { genes = {}; }
        var _this = this;
        genes = __assign(__assign(__assign({}, Worm.DEFAULT_GENES), genes), { maxHp: Worm.DEFAULT_GENES.maxHp * random(0.95, 1.05), maxVel: Worm.DEFAULT_GENES.maxVel * random(0.95, 1.05), maxForceFactor: Worm.DEFAULT_GENES.maxForceFactor * random(0.95, 1.05) });
        _this = _super.call(this, x, y, Worm.RADIUS, genes) || this;
        return _this;
    }
    Worm.prototype.clone = function () {
        entities.add(new Worm(this.pos.x + random(-this.genes.breedDist, this.genes.breedDist), this.pos.y + random(-this.genes.breedDist, this.genes.breedDist), this.genes));
    };
    Worm.prototype.update = function () {
        _super.prototype.update.call(this);
        var age = frameCount - this.birthFrame;
        if (age > this.genes.matureAge && random(1) < 0.1) {
            this.clone();
        }
    };
    Worm.prototype.render = function () {
        push();
        fill(lerpColor(color(50, 20, 10), color(50, 255, 60), this.hp / this.genes.maxHp));
        circle(this.pos.x, this.pos.y, this.r);
        pop();
    };
    Worm.prototype.steerEat = function () {
        var closest;
        return createVector(0, 0);
    };
    Worm.prototype.steerAvoid = function () {
        return createVector(0, 0);
    };
    Worm.DEFAULT_GENES = {
        maxHp: 5,
        maxVel: 1.5,
        maxForceFactor: 0.1,
    };
    return Worm;
}(Living));
var Circle = (function () {
    function Circle(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.rSquared = this.r * this.r;
    }
    Circle.prototype.contains = function (point) {
        var d = Math.pow((point.x - this.x), 2) + Math.pow((point.y - this.y), 2);
        return d <= this.rSquared;
    };
    Circle.prototype.intersects = function (range) {
        var xDist = Math.abs(range.x - this.x);
        var yDist = Math.abs(range.y - this.y);
        var r = this.r;
        var w = range.w;
        var h = range.h;
        var edges = Math.pow((xDist - w), 2) + Math.pow((yDist - h), 2);
        if (xDist > (r + w) || yDist > (r + h))
            return false;
        if (xDist <= w || yDist <= h)
            return true;
        return edges <= this.rSquared;
    };
    return Circle;
}());
var Point = (function () {
    function Point(x, y, data) {
        this.scanned = false;
        this.selected = false;
        this.x = x;
        this.y = y;
        this.data = data;
    }
    return Point;
}());
var QuadTree = (function () {
    function QuadTree(boundary, capacity, parent) {
        if (parent === void 0) { parent = null; }
        this.points = [];
        this.divided = false;
        this.visited = false;
        this.ignore = false;
        if (!boundary)
            throw TypeError('boundary is null or undefined');
        if (!(boundary instanceof Rectangle))
            throw TypeError('boundary should be a Rectangle');
        if (typeof capacity !== 'number')
            throw TypeError("capacity should be a number but is a " + typeof capacity);
        if (capacity < 1)
            throw RangeError('capacity must be greater than 0');
        this.boundary = boundary;
        this.capacity = capacity;
        this.parent = parent;
    }
    QuadTree.prototype.subdivide = function () {
        var x = this.boundary.x;
        var y = this.boundary.y;
        var w = this.boundary.w / 2;
        var h = this.boundary.h / 2;
        var ne = new Rectangle(x + w, y - h, w, h);
        var nw = new Rectangle(x - w, y - h, w, h);
        var se = new Rectangle(x + w, y + h, w, h);
        var sw = new Rectangle(x - w, y + h, w, h);
        this.ne = new QuadTree(ne, this.capacity, this);
        this.nw = new QuadTree(nw, this.capacity, this);
        this.se = new QuadTree(se, this.capacity, this);
        this.sw = new QuadTree(sw, this.capacity, this);
        this.divided = true;
    };
    QuadTree.prototype.prepareForVisit = function () {
        this.visited = false;
        this.ignore = false;
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var p = _a[_i];
            p.scanned = false;
            p.selected = false;
        }
        if (this.divided) {
            for (var _b = 0, _c = this.children(); _b < _c.length; _b++) {
                var child = _c[_b];
                child.prepareForVisit();
            }
        }
    };
    QuadTree.prototype.children = function () {
        return [this.nw, this.ne, this.sw, this.se];
    };
    QuadTree.prototype.insert = function (point) {
        if (!this.boundary.contains(point))
            return false;
        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        }
        if (!this.divided)
            this.subdivide();
        if (this.ne.insert(point) || this.nw.insert(point)
            || this.se.insert(point) || this.sw.insert(point)) {
            return true;
        }
    };
    QuadTree.prototype.query = function (range, found) {
        if (!found)
            found = [];
        if (!range.intersects(this.boundary))
            return found;
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var p = _a[_i];
            if (range.contains(p))
                found.push(p);
        }
        if (this.divided) {
            for (var _b = 0, _c = this.children(); _b < _c.length; _b++) {
                var child = _c[_b];
                child.query(range, found);
            }
        }
        return found.map(function (p) { return p.data; });
    };
    QuadTree.prototype.render = function () {
        if (this.divided) {
            for (var _i = 0, _a = this.children(); _i < _a.length; _i++) {
                var child = _a[_i];
                child.render();
            }
        }
        else {
        }
        push();
        stroke(255, 30);
        strokeWeight(1);
        noFill();
        if (this.visited) {
            strokeWeight(5);
            stroke(0, 255, 255);
        }
        if (this.ignore) {
            strokeWeight(5);
            stroke(255, 255, 0);
        }
        rectMode(CENTER);
        rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2);
        pop();
        push();
        strokeWeight(2);
        for (var _b = 0, _c = this.points; _b < _c.length; _b++) {
            var p = _c[_b];
            if (p.scanned)
                stroke(255, 150, 0);
            else if (p.selected)
                stroke(0, 255, 255);
            line(p.x - 10, p.y, p.x + 10, p.y);
            line(p.x, p.y - 10, p.x, p.y + 10);
        }
        pop();
    };
    return QuadTree;
}());
var QuadTreeVisitor = (function () {
    function QuadTreeVisitor(x, y, best, node) {
        this.x = x;
        this.y = y;
        this.root = node;
        this.currentNode = null;
        this.best = best;
        this.root.prepareForVisit();
    }
    QuadTreeVisitor.prototype.visitNextNode = function () {
        this.selectNextNode();
        var node = this.currentNode;
        var x = this.x;
        var y = this.y;
        var x1 = node.boundary.x1();
        var y1 = node.boundary.y1();
        var x2 = node.boundary.x2();
        var y2 = node.boundary.y2();
        node.visited = true;
        if (x < x1 - this.best.dist || x > x2 + this.best.dist || y < y1 - this.best.dist || y > y2 + this.best.dist) {
            node.ignore = true;
            return;
        }
        for (var _i = 0, _a = node.points; _i < _a.length; _i++) {
            var p = _a[_i];
            if (p) {
                p.scanned = true;
                var dx = p.x - x, dy = p.y - y, distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < this.best.dist) {
                    this.best.dist = distance;
                    if (this.best.p && this.best.p.selected)
                        this.best.p.selected = false;
                    this.best.p = p;
                    this.best.p.selected = true;
                }
            }
        }
    };
    QuadTreeVisitor.prototype.selectNextNode = function () {
        if (!this.currentNode) {
            this.currentNode = this.root;
            return;
        }
        var parent = this.currentNode;
        var children = this.currentNode.children();
        var rl = (2 * this.x > this.currentNode.boundary.x1() + this.currentNode.boundary.x2());
        var bt = (2 * this.y > this.currentNode.boundary.y1() + this.currentNode.boundary.y2());
        if (!this.currentNode.ignore) {
            if (children[bt * 2 + rl] && !children[bt * 2 + rl].visited) {
                this.currentNode = children[bt * 2 + rl];
            }
            else if (children[bt * 2 + (1 - rl)] && !children[bt * 2 + (1 - rl)].visited) {
                this.currentNode = children[bt * 2 + (1 - rl)];
            }
            else if (children[(1 - bt) * 2 + rl] && !children[(1 - bt) * 2 + rl].visited) {
                this.currentNode = children[(1 - bt) * 2 + rl];
            }
            else if (children[(1 - bt) * 2 + (1 - rl)] && !children[(1 - bt) * 2 + (1 - rl)].visited) {
                this.currentNode = children[(1 - bt) * 2 + (1 - rl)];
            }
            else {
                this.currentNode = this.currentNode.parent;
                this.selectNextNode();
                return;
            }
        }
        else {
            this.currentNode = this.currentNode.parent;
            this.selectNextNode();
            return;
        }
        this.currentNode.parent = parent;
    };
    QuadTreeVisitor.prototype.render = function () {
        push();
        stroke(255, 0, 255, 200);
        strokeWeight(6);
        rectMode(CENTER);
        if (this.currentNode)
            rect(this.currentNode.boundary.x, this.currentNode.boundary.y, this.currentNode.boundary.w * 2, this.currentNode.boundary.h * 2);
        fill(50, 255, 80);
        if (this.best.p)
            circle(this.best.p.x, this.best.p.y, 20);
        pop();
    };
    return QuadTreeVisitor;
}());
var Rectangle = (function () {
    function Rectangle(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    Rectangle.prototype.contains = function (point) {
        return (point.x >= this.x - this.w &&
            point.x <= this.x + this.w &&
            point.y >= this.y - this.h &&
            point.y <= this.y + this.h);
    };
    Rectangle.prototype.intersects = function (range) {
        return !(range.x - range.w > this.x + this.w ||
            range.x + range.w < this.x - this.w ||
            range.y - range.h > this.y + this.h ||
            range.y + range.h < this.y - this.h);
    };
    Rectangle.prototype.x1 = function () { return this.x - this.w; };
    Rectangle.prototype.x2 = function () { return this.x + this.w; };
    Rectangle.prototype.y1 = function () { return this.y - this.w; };
    Rectangle.prototype.y2 = function () { return this.y + this.h; };
    return Rectangle;
}());
//# sourceMappingURL=../sketch/sketch/build.js.map