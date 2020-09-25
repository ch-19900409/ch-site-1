/*
  Johan Karlsson, 2020
  https://twitter.com/DonKarlssonSan
  MIT License, see Details View
*/

// Change these!
const text = "#plottertwitter";
const fontSize = 120;


const svgNs = "http://www.w3.org/2000/svg";
let svg;
let simplex;
let xZoom, yZoom;
let deltaY;
let imageBuffer;
let w = 1000;
let h = 500;

// Why one line at a time?
// Eh... well, I took some old code of mine and re-purposed it.
class NoiseLine {
  constructor(x, y, length) {
    this.x = x;
    this.y = y;
    this.length = length;
  }
    
  draw(groupElement) {
    let segments = this.generateSegments();
    segments.forEach(segment => {
      let path = document.createElementNS(svgNs, "path");
      let commands = this.convertPointsToCommands(segment);
      path.setAttribute("d", commands); 
      groupElement.appendChild(path);
    });
  }
  
  generateSegments() {
    let segments = [];
    segments.push([]);
    let segmentIndex = 0;
    let dx = this.length / 300;
    for(let x = 0; x < this.length; x += dx) {
      let y = this.y + (simplex.noise2D(x / xZoom, this.y / yZoom)) * deltaY * 2;
      let index = Math.round(y) * w + Math.round(this.x + x);
      let isInside = index < imageBuffer.length && imageBuffer[index];
      if(isInside) {
        segmentIndex++;
        segments.push([]);
      } else {
        segments[segmentIndex].push(`${this.x + x}, ${y}`);
      }
    }
    return segments;
  }
  
  convertPointsToCommands(points) {
    let commands = [];
    commands.push(`M ${points[0]}`);
    for(let i = 1; i < points.length; i++) {
      commands.push(`L ${points[i]}`);
    }

    return commands.join(" ");
  }
}

function setup() {
  svg = document.querySelector("svg");
  document.addEventListener("click", draw);
  document.addEventListener("keydown", onKeyDown);

  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext("2d");
  canvas.width = w;
  canvas.height = h;
  storeTextInBuffer();
}

function onKeyDown (e) {
  if(e.code === "KeyD") {
    download();
  }
}

function download() {
  let svgDoc = svg.outerHTML;
  let filename = "text-lines.svg";
  let element = document.createElement("a");
  element.setAttribute("href", "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgDoc));
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.addEventListener("click", e => e.stopPropagation());
  element.click();
  document.body.removeChild(element);
}

function storeTextInBuffer() {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${fontSize}px seri`;
  ctx.fillText(text, w / 2, h / 2);
  let image = ctx.getImageData(0, 0, w, h);
  imageBuffer = new Uint32Array(image.data.buffer);
}

function draw() {
  console.clear();
  simplex = new SimplexNoise();
  let group = document.querySelector("g");
  if(group) {
    group.remove();
  }
  
  group = document.createElementNS(svgNs, "g");
  group.setAttribute("stroke-width", 0.5);
  group.setAttribute("fill", "none");
  group.setAttribute("stroke", "black");
  
  xZoom = yZoom = Math.random() * 200 + 50;
  let lines = [];
  deltaY = Math.random() * 3 + 2;
  for(let y = 0; y <= 500; y += deltaY) {
    line = new NoiseLine(50, y, 900);
    lines.push(line);
  }
  lines.forEach(l => l.draw(group));
  svg.appendChild(group);
}

setup();
draw();
