let canvas;
let fluidImg;

let circles = [];

function setup() {
    colorMode(RGB, 1);
    canvas = createCanvas(windowWidth, windowHeight);
    fluidImg = createImage(windowWidth, windowHeight);

    fluidImg.loadPixels();

    for (let i = 0; i < fluidImg.width; i++) {
        for (let j = 0; j < fluidImg.height; j++) {
            fluidImg.set(i, j, color(.21,.21,.21));
        }
    }

    fluidImg.updatePixels();
}

function draw() {

    fluidImg.loadPixels();

    circles.forEach((circle) => {
        drawCircleInImg(fluidImg, circle);
    });

    fluidImg.updatePixels();

    image(fluidImg, 0, 0);
}

function drawCircleInImg(img, circle) {
    let x = circle.position.x;
    let y = circle.position.y;
    let r = circle.radius;
    
    img.loadPixels();
    for (let i = r; i > 0; i-=.01) {
        for (let j = 0; j < 360; j++) {
            let rads = toRadians(j);
            let xPos = x + r * cos(j);
            let yPos = y + r * sin(j);
            img.set(xPos, yPos, circle.col);
        }
    }
    img.updatePixels();
}

function toRadians(degree) {
    return degree * (PI / 180.0);
}

function mouseClicked() {
    if (mouseButton == LEFT) {
        let pos = createVector(mouseX, mouseY);
        let c = color(1, 0, 0);
        console.log("Added circle");
        circles.push(new Circle(pos, 25, c));
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    fluidImg = createImage(windowWidth, windowHeight);
}