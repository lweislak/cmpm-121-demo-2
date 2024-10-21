import "./style.css";

const APP_NAME = "Canvas Drawing";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
//app.innerHTML = APP_NAME;

//Create canvas
const canvas: HTMLCanvasElement = document.createElement("canvas");
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!; //Check that result isn't null
canvas.setAttribute("width", "256");
canvas.setAttribute("height", "256");
app.append(canvas);

ctx.strokeStyle = 'black'; //Set line color and thickness
ctx.lineWidth = 1;

//Create clear button
const clearButton = document.createElement("button");
clearButton.innerText = "Clear";
app.append(clearButton);

let isDrawing: boolean = false;
let x: number = 0;
let y: number = 0;

addEventListener("mousedown", (e) => {
  x = e.offsetX;
  y = e.offsetY;
  isDrawing = true;
});

addEventListener("mousemove", (e) => {
  if(isDrawing) {
    drawOnCanvas(ctx, x, y, e.offsetX, e.offsetY);
    x = e.offsetX;
    y = e.offsetY;
  }
});

addEventListener("mouseup", (e) => {
  if(isDrawing) {
    drawOnCanvas(ctx, x, y, e.offsetX, e.offsetY);
    x = 0;
    y = 0;
    isDrawing = false;
  }
});

clearButton.addEventListener("click", function() {
  clearCanvas();
});

//Function to draw on canvas using mouse location
function drawOnCanvas(ctx: CanvasRenderingContext2D, 
  x1: number, y1: number, x2: number, y2: number) {
    ctx.beginPath();
    ctx.moveTo(x1, y1); //Previous location
    ctx.lineTo(x2, y2); //Current location
    ctx.stroke();
    ctx.closePath();
}

//Function to clear the canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}