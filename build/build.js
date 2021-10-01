var entities;
var qtree;
var qtreeVisitor;
var view;
var chart;
function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(30).noFill().noStroke().rectMode(CENTER);
    view = new View(width / 4, height / 2, 0.89);
    entities = new EntitiesList();
    for (var i = 0; i < 60; i++) {
        var x = randomGaussian(0, width * 2);
        var y = randomGaussian(0, height * 2);
        var n = new Nutrient(x, y, random(50, 400), ceil(random(2, 20)));
        n.ageGrowPlants = 0;
        n.pGrowPlants = Infinity;
        entities.add(n);
    }
    for (var i = 0; i < 0; i++) {
        entities.add(new Worm(random(-width, width), random(-height, height)));
    }
    for (var i = 0; i < 0; i++) {
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
    push();
    stroke(255);
    strokeWeight(1);
    rect(0, 0, 1800, 1800);
    pop();
    if (frameCount % 2 === 0) {
        chart.add(entities.plants.length, 0);
        chart.add(entities.worms.length, 1);
        chart.add(entities.chickens.length, 2);
    }
    chart.render();
}
function quadtree() {
    var boundary = new Rectangle(0, 0, 900, 900);
    qtree = new QuadTree(boundary, 4);
    for (var _i = 0, _a = entities.all(); _i < _a.length; _i++) {
        var e = _a[_i];
        qtree.insert(new Point(e.pos.x, e.pos.y, e));
    }
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
function mouseWheel(e) {
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
        if (mouseIsPressed && (mouseButton === CENTER || mouseButton === RIGHT)) {
            this.x += movedX * 2;
            this.y += movedY * 2;
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
        this.worms = [];
        this.chickens = [];
    }
    EntitiesList.prototype.add = function (e) {
        if (e instanceof Nutrient) {
            var neighboors = (qtree)
                ? qtree.queryAll(new Circle(e.pos.x, e.pos.y, 40), function (e) { return (e instanceof Nutrient); })
                : [];
            if (neighboors.length > 0) {
                var receiver = neighboors[floor(random(neighboors.length))];
                receiver.nutrition += e.nutrition;
                receiver.r += e.nutrition * 10;
            }
            else {
                this.nutrients.push(e);
            }
        }
        if (e instanceof Plant)
            this.plants.push(e);
        if (e instanceof Worm)
            this.worms.push(e);
        if (e instanceof Chicken)
            this.chickens.push(e);
    };
    EntitiesList.prototype.all = function () {
        return __spreadArrays(this.nutrients, this.plants, this.worms, this.chickens);
    };
    EntitiesList.prototype.update = function () {
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
        for (var i = this.worms.length - 1; i >= 0; i--) {
            if (this.worms[i].dead()) {
                this.worms.splice(i, 1);
            }
        }
        for (var i = this.chickens.length - 1; i >= 0; i--) {
            if (this.chickens[i].dead()) {
                this.chickens.splice(i, 1);
            }
        }
        for (var _i = 0, _a = entities.all(); _i < _a.length; _i++) {
            var e = _a[_i];
            e.update();
        }
    };
    EntitiesList.prototype.render = function () {
        for (var _i = 0, _a = entities.all(); _i < _a.length; _i++) {
            var e = _a[_i];
            e.render();
        }
    };
    EntitiesList.prototype.energySum = function () {
        return this.nutrients.reduce(function (acc, n) { return acc + n.nutrition; }, 0)
            + this.plants.reduce(function (acc, p) { return acc + p.hp; }, 0)
            + this.worms.reduce(function (acc, w) { return acc + w.hp; }, 0)
            + this.chickens.reduce(function (acc, c) { return acc + c.hp; }, 0);
    };
    return EntitiesList;
}());
var Entity = (function () {
    function Entity(x, y, r, maxSpeed) {
        if (r === void 0) { r = 8; }
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.maxSpeed = Infinity;
        this.pos = createVector(x, y);
        this.maxSpeed = maxSpeed;
        this.r = r;
        this.birthFrame = frameCount;
    }
    Entity.prototype.age = function () {
        return frameCount - this.birthFrame;
    };
    Entity.prototype.applyForce = function (force) {
        this.acc.add(force);
    };
    Entity.prototype.intersects = function (e) {
        return (this.pos.dist(e.pos) < (this.r + e.r));
    };
    Entity.prototype.update = function () {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.boundaries();
    };
    Entity.prototype.boundaries = function () {
        if (this.pos.x > qtree.boundary.w)
            this.pos.x -= 2 * qtree.boundary.w;
        if (this.pos.x < -qtree.boundary.w)
            this.pos.x += 2 * qtree.boundary.w;
        if (this.pos.y > qtree.boundary.h)
            this.pos.y -= 2 * qtree.boundary.h;
        if (this.pos.y < -qtree.boundary.h)
            this.pos.y += 2 * qtree.boundary.h;
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
        _this.pGrowPlants = 0.007;
        _this.nutrition = nutrition;
        _this.ageGrowPlants = Nutrient.AGE_GROW_PLANTS_MEAN * random(0.8, 1.4);
        return _this;
    }
    Nutrient.prototype.update = function () {
        _super.prototype.update.call(this);
        this.tryGrowPlant();
    };
    Nutrient.prototype.tryGrowPlant = function () {
        if (this.age() < this.ageGrowPlants)
            return;
        if (random(1) < this.nutrition * this.pGrowPlants) {
            var plantMaxHp = min(this.nutrition, Plant.DEFAULT_GENES.maxHp);
            this.nutrition -= plantMaxHp;
            entities.add(new Plant(randomGaussian(this.pos.x, this.r * 0.5), randomGaussian(this.pos.y, this.r * 0.5), { maxHp: plantMaxHp }));
        }
    };
    Nutrient.prototype.render = function () {
        push();
        fill(lerpColor(color(32), color(50, 40, 25), this.nutrition / 50));
        noStroke();
        circle(this.pos.x, this.pos.y, this.r);
        pop();
    };
    Nutrient.AGE_GROW_PLANTS_MEAN = 50;
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
        var _this = this;
        genes = __assign(__assign({}, Living.DEFAULT_GENES), genes);
        _this = _super.call(this, x, y, r, genes.maxSpeed) || this;
        _this.genes = genes;
        _this.hp = genes.maxHp;
        return _this;
    }
    Living.prototype.dead = function () {
        return this.hp <= 0;
    };
    Living.prototype.update = function () {
        if (this.dead())
            return;
        _super.prototype.update.call(this);
    };
    Living.RADIUS = 6;
    Living.DEFAULT_GENES = {
        maxHp: 1,
    };
    return Living;
}(Entity));
var Plant = (function (_super) {
    __extends(Plant, _super);
    function Plant(x, y, genes) {
        if (genes === void 0) { genes = Plant.randGenes(); }
        var _this = this;
        genes = __assign(__assign({}, Plant.DEFAULT_GENES), genes);
        genes = __assign({}, genes);
        _this = _super.call(this, x, y, Plant.RADIUS, genes) || this;
        return _this;
    }
    Plant.randGenes = function () {
        return {
            maxHp: 1,
        };
    };
    Plant.prototype.update = function () {
        _super.prototype.boundaries.call(this);
    };
    Plant.prototype.render = function () {
        push();
        fill(lerpColor(color(50, 20, 10), color(50, 255, 60), this.hp / this.genes.maxHp));
        circle(this.pos.x, this.pos.y, this.r);
        pop();
    };
    Plant.RADIUS = 8;
    Plant.DEFAULT_GENES = {
        maxHp: 1,
    };
    return Plant;
}(Living));
var Animal = (function (_super) {
    __extends(Animal, _super);
    function Animal(x, y, r, genes) {
        if (genes === void 0) { genes = {}; }
        var _this = this;
        genes = __assign(__assign({}, Animal.DEFAULT_GENES), genes);
        _this = _super.call(this, x, y, r, genes) || this;
        _this.vel = p5.Vector.random2D().mult(random(1.5, 2.5));
        _this.ageNextDefecate = _this.age() + max(30, floor(randomGaussian(_this.genes.ageNextDefecateMean, 30)));
        return _this;
    }
    Animal.prototype.maxForce = function () {
        return this.genes.maxForceFactor * 1 / this.genes.maxSpeed;
    };
    Animal.prototype.update = function () {
        _super.prototype.update.call(this);
        this.tryBreed();
        this.tryDefecate();
        this.applyForce(this.steerApproach().mult(this.genes.eatWeight));
        this.applyForce(this.steerAvoid().mult(this.genes.avoidWeight));
    };
    Animal.prototype.render = function () {
        push();
        strokeWeight(1);
        stroke(255, 200);
        line(this.pos.x - 10, this.pos.y - 10, this.pos.x + 10, this.pos.y + 10);
        line(this.pos.x + 10, this.pos.y + 10, this.pos.x - 10, this.pos.y - 10);
        pop();
    };
    Animal.prototype.tryEat = function (target) {
        if (this.pos.dist(target.pos) > this.r)
            return;
        this.hp += target.hp;
        target.hp = 0;
    };
    Animal.prototype.tryDefecate = function () {
        if (this.ageNextDefecate > this.age())
            return;
        this.ageNextDefecate = this.age() + max(30, floor(randomGaussian(this.genes.ageNextDefecateMean, 30)));
        entities.add(new Nutrient(this.pos.x, this.pos.y, this.r * random(5, 10), min(this.genes.lossHp, this.hp)));
        this.hp -= min(this.genes.lossHp, this.hp);
    };
    Animal.prototype.seek = function (target) {
        var desired = p5.Vector.sub(target.pos, this.pos)
            .setMag(this.genes.maxSpeed);
        var steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce());
        return steer;
    };
    Animal.DEFAULT_GENES = {
        maxHp: 4,
        lossHp: 1,
        breedHpFactor: 2,
        maxSpeed: 2,
        maxForceFactor: 0.1,
        eatWeight: 2,
        avoidWeight: -2,
        ageNextDefecateMean: 80,
    };
    return Animal;
}(Living));
var Chicken = (function (_super) {
    __extends(Chicken, _super);
    function Chicken(x, y, genes) {
        if (genes === void 0) { genes = Chicken.randGenes(); }
        var _this = this;
        genes = __assign(__assign({}, Chicken.DEFAULT_GENES), genes);
        genes = __assign(__assign({}, genes), { maxHp: genes.maxHp, lossHp: genes.lossHp * random(0.9, 1.1), breedHpFactor: genes.breedHpFactor * random(0.9, 1.1), maxSpeed: genes.maxSpeed * random(0.9, 1.1), maxForceFactor: genes.maxForceFactor * random(0.9, 1.1), eatWeight: genes.eatWeight * random(0.8, 1.2), avoidWeight: genes.avoidWeight * random(0.9, 1.1), eatPerception: genes.eatPerception * random(0.8, 1.2), avoidPerception: genes.avoidPerception * random(0.9, 1.1), ageNextDefecateMean: genes.ageNextDefecateMean * random(0.98, 1.02) });
        _this = _super.call(this, x, y, Chicken.RADIUS, genes) || this;
        _this.vel = p5.Vector.random2D().mult(random(1.5, 2.5));
        return _this;
    }
    Chicken.randGenes = function () {
        return {
            maxHp: 16,
            lossHp: random(1.8, 2.2),
            breedHpFactor: random(1.7, 2.3),
            maxSpeed: random(7., 9.),
            maxForceFactor: random(1.5, 2.),
            eatWeight: random(-1, 10),
            avoidWeight: random(-10, 1),
            eatPerception: random(60, 100),
            avoidPerception: random(60, 100),
            ageNextDefecateMean: random(60, 100),
        };
    };
    Chicken.prototype.render = function () {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading() + HALF_PI);
        fill(this.hp >= this.genes.breedHpFactor * this.genes.maxHp - Worm.DEFAULT_GENES.maxHp
            ? color(0, 180, 255)
            : lerpColor(color(120, 20, 0), color(255, 20, 128), this.hp / this.genes.maxHp));
        beginShape();
        vertex(0, -this.r);
        vertex(-this.r, this.r);
        vertex(this.r, this.r);
        endShape(CLOSE);
        pop();
        if (keyIsDown && key === '1') {
            push();
            stroke(0, 255, 0);
            strokeWeight(1);
            noFill();
            circle(this.pos.x, this.pos.y, this.genes.eatPerception * 2);
            pop();
        }
    };
    Chicken.prototype.tryBreed = function () {
        if (this.hp < this.genes.breedHpFactor * this.genes.maxHp)
            return;
        var offspring = new Chicken(this.pos.x, this.pos.y, this.genes);
        offspring.hp = min(this.hp / 2, offspring.genes.maxHp);
        this.hp -= min(this.hp / 2, offspring.genes.maxHp);
        entities.add(offspring);
    };
    Chicken.prototype.steerApproach = function () {
        var food = qtree.nearest(this.pos.x, this.pos.y, function (e) { return (e instanceof Worm); }, this.genes.eatPerception);
        if (!food)
            return createVector(0, 0);
        this.tryEat(food);
        return this.seek(food);
    };
    Chicken.prototype.steerAvoid = function () {
        var nearest = qtree.nearest(this.pos.x, this.pos.y, function (e) { return (e instanceof Chicken); }, this.genes.avoidPerception);
        if (!nearest)
            return createVector(0, 0);
        return this.seek(nearest);
    };
    Chicken.RADIUS = 16;
    Chicken.DEFAULT_GENES = {
        maxHp: 16,
        lossHp: 2,
        breedHpFactor: 2,
        maxSpeed: 6,
        maxForceFactor: 1,
        eatWeight: 5,
        avoidWeight: -2,
        eatPerception: 120,
        avoidPerception: 80,
        ageNextDefecateMean: 80,
    };
    return Chicken;
}(Animal));
var Worm = (function (_super) {
    __extends(Worm, _super);
    function Worm(x, y, genes) {
        if (genes === void 0) { genes = Worm.randGenes(); }
        var _this = this;
        genes = __assign(__assign({}, Worm.DEFAULT_GENES), genes);
        genes = __assign(__assign({}, genes), { maxHp: genes.maxHp, lossHp: genes.lossHp * random(0.9, 1.1), breedHpFactor: genes.breedHpFactor * random(0.9, 1.1), maxSpeed: genes.maxSpeed * random(0.95, 1.05), maxForceFactor: genes.maxForceFactor * random(0.95, 1.05), eatWeight: genes.eatWeight * random(0.9, 1.1), avoidWeight: genes.avoidWeight * random(0.9, 1.1), eatPerception: genes.eatPerception * random(0.9, 1.1), avoidPerception: genes.avoidPerception * random(0.9, 1.1), ageNextDefecateMean: genes.ageNextDefecateMean * random(0.98, 1.02) });
        _this = _super.call(this, x, y, Worm.RADIUS, genes) || this;
        _this.vel = p5.Vector.random2D().mult(random(1.5, 2.5));
        return _this;
    }
    Worm.randGenes = function () {
        return {
            maxHp: 3,
            lossHp: random(0.8, 1.2),
            breedHpFactor: random(1.7, 2.3),
            maxSpeed: random(2.5, 4.5),
            maxForceFactor: random(0.2, 0.4),
            eatWeight: random(-1, 5),
            avoidWeight: random(-5, 1),
            eatPerception: random(60, 200),
            avoidPerception: random(60, 200),
            ageNextDefecateMean: random(80, 120),
        };
    };
    Worm.prototype.render = function () {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading() + HALF_PI);
        fill(lerpColor(color(50, 20, 10), color(255, 200, 128), this.hp / this.genes.maxHp));
        rect(0, 0, this.r, this.r * 5);
        pop();
        if (keyIsDown && key === '0') {
            push();
            stroke(0, 255, 0);
            strokeWeight(1);
            noFill();
            circle(this.pos.x, this.pos.y, this.genes.eatPerception * 2);
            pop();
        }
    };
    Worm.prototype.tryBreed = function () {
        if (this.hp < this.genes.breedHpFactor * this.genes.maxHp)
            return;
        var offspring = new Worm(this.pos.x, this.pos.y, this.genes);
        offspring.hp = min(this.hp / 2, offspring.genes.maxHp);
        this.hp -= min(this.hp / 2, offspring.genes.maxHp);
        entities.add(offspring);
    };
    Worm.prototype.steerApproach = function () {
        var food = qtree.nearest(this.pos.x, this.pos.y, function (e) { return (e instanceof Plant); }, this.genes.eatPerception);
        if (!food)
            return createVector(0, 0);
        this.tryEat(food);
        return this.seek(food);
    };
    Worm.prototype.steerAvoid = function () {
        var _this = this;
        var nearestChicken = qtree.nearest(this.pos.x, this.pos.y, function (e) { return (e !== _this && e instanceof Chicken); }, this.genes.avoidPerception);
        var nearestWorm = qtree.nearest(this.pos.x, this.pos.y, function (e) { return (e !== _this && e instanceof Worm); }, this.genes.avoidPerception);
        var force = createVector(0, 0);
        if (nearestChicken)
            force = force.add(this.seek(nearestChicken));
        if (nearestWorm)
            force = force.add(this.seek(nearestWorm));
        return force;
    };
    Worm.RADIUS = 6;
    Worm.DEFAULT_GENES = {
        maxHp: 3,
        lossHp: 1,
        breedHpFactor: 2,
        maxSpeed: 3,
        maxForceFactor: 0.3,
        eatWeight: 2,
        avoidWeight: -5,
        eatPerception: 80,
        avoidPerception: 200,
        ageNextDefecateMean: 100,
    };
    return Worm;
}(Animal));
var LineChart = (function () {
    function LineChart(x, y, sizeX, sizeY) {
        if (sizeX === void 0) { sizeX = 600; }
        if (sizeY === void 0) { sizeY = 400; }
        this.datasets = [];
        this.pos = createVector(x, y);
        this.size = createVector(sizeX, sizeY);
    }
    LineChart.prototype.add = function (value, set) {
        if (set === void 0) { set = 0; }
        if (this.datasets[set] === undefined) {
            this.datasets[set] = {
                values: [],
                color: LineChart.COLORS[set],
                scale: LineChart.SCALES[set],
            };
        }
        if (this.datasets[set].values.length > this.size.y - 100) {
            for (var _i = 0, _a = this.datasets; _i < _a.length; _i++) {
                var d = _a[_i];
                d.values.splice(0, 1);
            }
        }
        this.datasets[set].values.push(value);
    };
    LineChart.prototype.update = function () {
    };
    LineChart.prototype.render = function () {
        var m = 50;
        push();
        translate(this.pos.x, this.pos.y);
        scale(1, -1);
        push();
        fill(20, 200);
        rectMode(CORNER);
        rect(0, 0, this.size.x, this.size.y);
        pop();
        push();
        stroke(200);
        strokeWeight(1);
        translate(m, m);
        line(0, 0, 0, this.size.y - m * 2);
        line(0, 0, this.size.x - m * 2, 0);
        pop();
        push();
        stroke(255);
        strokeWeight(3);
        translate(m, m);
        for (var _i = 0, _a = this.datasets; _i < _a.length; _i++) {
            var set_1 = _a[_i];
            push();
            beginShape();
            stroke(set_1.color);
            for (var j = 0; j < set_1.values.length; ++j) {
                vertex(j, set_1.values[j] * set_1.scale);
            }
            endShape();
            pop();
        }
        pop();
        pop();
    };
    LineChart.COLORS = ['#5f5', '#fc8', '#f59'];
    LineChart.SCALES = [2, 4, 4];
    return LineChart;
}());
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
    QuadTree.prototype.nearest = function (x, y, filter, maxDist) {
        var visitor = new QuadTreeVisitor(x, y, this, filter, maxDist);
        visitor.visit();
        return (visitor.best.p) ? visitor.best.p.data : null;
    };
    QuadTree.prototype.queryAll = function (range, filter, found) {
        if (filter === void 0) { filter = function (e) { return true; }; }
        if (!found)
            found = [];
        if (!range.intersects(this.boundary))
            return found.map(function (p) { return p.data; });
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var p = _a[_i];
            if (range.contains(p) && filter(p.data))
                found.push(p);
        }
        if (this.divided) {
            for (var _b = 0, _c = this.children(); _b < _c.length; _b++) {
                var child = _c[_b];
                child.queryAll(range, filter, found);
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
            push();
            stroke(255, 30);
            strokeWeight(3);
            if (this.visited) {
                strokeWeight(5);
                stroke(0, 255, 255);
            }
            if (this.ignore) {
                strokeWeight(2);
                stroke(255, 255, 0);
            }
            rectMode(CENTER);
            rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2);
            pop();
        }
        push();
        strokeWeight(1);
        stroke(255, 200);
        for (var _b = 0, _c = this.points; _b < _c.length; _b++) {
            var p = _c[_b];
            line(p.x - 10, p.y, p.x + 10, p.y);
            line(p.x, p.y - 10, p.x, p.y + 10);
        }
        pop();
    };
    return QuadTree;
}());
var QuadTreeVisitor = (function () {
    function QuadTreeVisitor(x, y, qtree, filter, maxDist) {
        if (maxDist === void 0) { maxDist = Infinity; }
        this.x = x;
        this.y = y;
        this.root = qtree;
        this.currentNode = null;
        this.filter = filter || (function () { return true; });
        this.best = { dist: maxDist, p: null };
        this.root.prepareForVisit();
    }
    QuadTreeVisitor.prototype.visit = function () {
        this.visitNextNode();
        do {
            this.visitNextNode();
        } while (this.currentNode !== this.root);
    };
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
                if (distance < this.best.dist && this.filter(p.data)) {
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
        fill(255);
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