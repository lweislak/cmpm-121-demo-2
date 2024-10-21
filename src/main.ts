import "./style.css";

const APP_NAME = "Hello!";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
//app.innerHTML = APP_NAME;

//Create canvas
const canvas: HTMLCanvasElement = document.createElement('canvas');
const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!; //Check that result isn't null
app.append(canvas);
ctx.strokeStyle = 'black';
ctx.lineWidth = 1;

//Create clear button
const clearButton = document.createElement('button');
clearButton.innerText = 'Clear';
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
    console.log(`x: ${x}, y:${y}\nOffX:${e.offsetX}, OffY:${e.offsetY}`);
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

//Function to draw on canvas if mouse is down
function drawOnCanvas(ctx: CanvasRenderingContext2D, 
  x1: number, y1: number, x2: number, y2: number) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}