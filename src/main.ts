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


//Observer that will clear and redraw lines
//https://dev.to/parenttobias/a-simple-observer-in-vanilla-javascript-1m80
const Observable = (points: number[][]) => {
  const mousePoints: number[][] = points;
  const update = (newPoints:number[]) =>
    mousePoints.push(newPoints);
  return {
    get mousePoints() {return mousePoints;},
    update
  }
};

const observer = Observable([]); //Start with no points
const drawingChanged = new Event("drawing-changed");
canvas.addEventListener("drawing-changed", () => {
  //clearCanvas();
  ctx.beginPath();
  ctx.moveTo(x, y); //Previous location
  const lastElem: number = observer.mousePoints.length - 1;
  ctx.lineTo(observer.mousePoints[lastElem][0], observer.mousePoints[lastElem][1]); //Current location
  ctx.stroke();
  ctx.closePath();
});


addEventListener("mousedown", (e) => {
  x = e.offsetX;
  y = e.offsetY;
  isDrawing = true;
});

addEventListener("mousemove", (e) => {
  if(isDrawing) {
    observer.update([e.offsetX,e.offsetY]);
    canvas.dispatchEvent(drawingChanged);
    x = e.offsetX;
    y = e.offsetY;
  }
});

addEventListener("mouseup", () => {
  if(isDrawing) {
    canvas.dispatchEvent(drawingChanged);
    x = 0;
    y = 0;
    isDrawing = false;
  }
});

clearButton.addEventListener("click", function() {
  clearCanvas();
});

//Function to clear the canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}