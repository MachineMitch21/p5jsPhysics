let canvas;

let circles = [];

let quadtree;

let debug = true;
let previousTime = currentTime();

let startPos;
let endPos;
let numClicks = 0;

function currentTime() {
    return new Date().getTime()/100;
}

function setup() {
    colorMode(RGB, 1);
    ellipseMode(CENTER);
    canvas = createCanvas(windowWidth, windowHeight);
}

function draw() {
    quadtree = new Quadtree(new AABB(new Point(windowWidth / 2, windowHeight / 2), windowWidth, windowHeight), 1);
    background(.21);

    let time = currentTime();

    let deltaTime = time - previousTime;
    tick(circles, quadtree, deltaTime);

    previousTime = currentTime();
}

function tick(circles, qTree, deltaTime) {
    qTree.insertAll(circles);

    circles.forEach((circle) => {
        fill(circle.col);
        strokeWeight(2);
        stroke(0);
        ellipse(circle.position.x, circle.position.y, circle.radius * 2, circle.radius * 2);
        updatePosition(circle, qTree, deltaTime);
    });

    if (debug) {
        qTree.debugRender(color(0, 0, 1), .9);
    }
}

function updatePosition(circle, qTree, deltaTime) {
    let aabb = circle.aabb;
    let circlesInRange = qTree.queryRange(aabb);

    for (let i = 0; i < circlesInRange.length; i++) {
        let ci = circlesInRange[i];
        if (circle === ci) continue;
    
        if (circle.intersectsCircle(ci, debug)) {
            let dir = createVector(0,0);
            dir = p5.Vector.sub(circle.position, ci.position);

            let ciDir = dir.copy().sub(ci.acceleration.copy().normalize()).normalize();
            let circleDir = p5.Vector.mult(dir, -1).sub(circle.acceleration.copy().normalize()).normalize();

            circle.applyForce(ciDir, (Math.log2(ci.mass) * Math.log2(ci.acceleration.mag())) / 2);
            ci.applyForce(circleDir, (Math.log2(circle.mass) * Math.log2(circle.acceleration.mag())) / 2);       
        }
    }

    if (debug) {
        rectMode(CENTER);
        noFill();
        stroke(0, 1, 0);
        strokeWeight(1);
        rect(aabb.centerPoint.x, aabb.centerPoint.y, aabb.width, aabb.height);
        rectMode(CORNER);
    }
    
    let x = circle.position.x;
    let y = circle.position.y;
    let vx = circle.velocity.x;
    let vy = circle.velocity.y;
    let r = circle.radius;

    circle.setPos(x, y);

    let m = vx != 0 ? vy / vx : vy;
    let b = getYIntercept(m, circle.position);

    if (x < -r) {
        // let newY = m * windowWidth + b;
        circle.setPosX(windowWidth + r);
    }

    if (x > windowWidth + r) {
        circle.setPosX(-r);
    }

    if (y < -r) {
        // let newX = (windowHeight - b) / m;
        circle.setPosY(windowHeight + r);
    }

    if (y > windowHeight + r) {
        // let newX = -b / m;
        circle.setPosY(-r);        
    }

    circle.position.add(p5.Vector.mult(circle.velocity, deltaTime));
    circle.velocity = p5.Vector.mult(circle.acceleration, deltaTime);
    circle.acceleration.add(circle.calcDragForce());
}


function getYIntercept(slope, coord) {
    return slope * -coord.x + coord.y;
}

function mouseClicked() {
    if (mouseButton === LEFT && numClicks === 0) {        
        startPos = createVector(mouseX, mouseY);
        numClicks++;
    } else if (mouseButton === LEFT && numClicks === 1) {
        endPos = createVector(mouseX, mouseY);
        
        let c = color(1, 1, 1);
        let circle = new Circle(startPos, c, random(25, 100), p5.Vector.sub(endPos, startPos));
        circles.push(circle);

        numClicks++;
    }

    if (numClicks === 2) numClicks = 0;
}

function keyPressed() {
    if (keyCode === 87) {
        debug = !debug;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}