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

 //Set line color and thickness
ctx.strokeStyle = 'black';
ctx.lineWidth = 1;

//Create clear button
const clearButton = document.createElement("button");
clearButton.innerText = "Clear";
app.append(clearButton);

//Create undo button
const undoButton = document.createElement("button");
undoButton.innerText = "Undo";
app.append(undoButton);

//Create redo button
const redoButton = document.createElement("button");
redoButton.innerText = "Redo";
app.append(redoButton);

let isDrawing: boolean = false;
let x: number = 0;
let y: number = 0;


//Observer that will clear and redraw lines
//Helpful code: https://dev.to/parenttobias/a-simple-observer-in-vanilla-javascript-1m80
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

//Event that checks for a change in the drawing
const drawingChanged = new Event("drawing-changed");
canvas.addEventListener("drawing-changed", () => {
  ctx.beginPath();
  ctx.moveTo(x, y); //Previous location
  const lastElem: number = observer.mousePoints.length - 1;
  ctx.lineTo(observer.mousePoints[lastElem][0], observer.mousePoints[lastElem][1]); //Current location
  ctx.stroke();
  ctx.closePath();
});

//Event that checks the canvas for mouse click down
canvas.addEventListener("mousedown", (e) => {
  x = e.offsetX; y = e.offsetY;
  isDrawing = true;
});

//Event that checks the canvas for mouse movement
canvas.addEventListener("mousemove", (e) => {
  if(isDrawing) {
    observer.update([e.offsetX,e.offsetY]);
    canvas.dispatchEvent(drawingChanged);
    x = e.offsetX; y = e.offsetY;
  }
});

//Event that checks the canvas for mouse click up
canvas.addEventListener("mouseup", () => {
  if(isDrawing) {
    canvas.dispatchEvent(drawingChanged);
    isDrawing = false;
  }
});

//Event that checks if clear button has been clicked
clearButton.addEventListener("click", function() {
  clearCanvas();
});

//Event that checks if undo button has been clicked
undoButton.addEventListener("click", function() {
  //Do Something
});

//Event that checks if redo button has been clicked
undoButton.addEventListener("click", function() {
  //Do Something
});

//Helper function to clear the canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  observer.mousePoints.length = 0;
}