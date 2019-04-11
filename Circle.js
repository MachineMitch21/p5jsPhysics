
let numCircles = 0;

let Circle = function(pos, col, radius, initialVelocity) {
    this.id = numCircles++;

    // point for our quadtree to use
    this.point = new Point(pos.x, pos.y);
    this.aabb = new AABB(this.point, radius * 4, radius * 4);
    this.position = pos;
    this.col = col;
    this.radius = radius;
    this.velocity = createVector(0, 0);
    this.acceleration = initialVelocity || createVector(random(-50, 50), random(-50, 50));
    this.mass = radius * 2;
    this.drag = .0025;

    this.setPos = function(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.point.x = x;
        this.point.y = y;
        this.aabb.centerPoint = this.point;
    }

    this.setPosX = function(x) {
        this.setPos(x, this.position.y);
    }

    this.setPosY = function(y) {
        this.setPos(this.position.x, y);
    }

    this.calcDragForce = function() {
        let dragForceMag = this.drag * ((Math.pow(this.velocity.mag(), 2) * (this.mass / this.getVolume())) * .5) * this.getArea();
        let v = this.velocity.copy();

        dragForceMag = Math.round((dragForceMag + 0.00001) * 1000) / 1000;

        // dragForceMag = (dragForceMag <= 0.03 ? .5 : dragForceMag);

        v.normalize().mult(-1);
        return v.mult(dragForceMag);
    }

    this.applyForce = function(forceDir, forceMagnitude) {
        let force = p5.Vector.mult(forceDir, forceMagnitude);
        this.acceleration.add(force);
    }

    this.getArea = function() {
        return PI * Math.pow(this.radius, 2);
    }

    this.getVolume = function() {
        return 1.33 * PI * Math.pow(this.radius, 3);
    }

    this.intersectsCircle = function(circle, shouldDebug) {
        let d = p5.Vector.dist(this.position, circle.position);
        let doCollide = false;

        if (d < this.radius + circle.radius) {
            doCollide = true;
        }
        
        if (shouldDebug) {
            let dir = p5.Vector.sub(this.position, circle.position);
            dir.div(2);
            noFill();
            stroke(1);
            strokeWeight(2);
            ellipse(this.position.x - dir.x, this.position.y - dir.y, d, d);
        }

        return doCollide;
    }
}