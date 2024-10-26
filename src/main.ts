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

let isDrawing: boolean = false; //Check if canvas is being drawn on
let x: number = 0; //x and y mouse pointer coordinates
let y: number = 0;

const lines: CMDDrawLines[] = [];
const redoLines: CMDDrawLines[] = [];
let currLine: CMDDrawLines;

class CMDDrawLines {
  line: {x: number, y: number}[] = [];

  //Add points to line
  drag(x: number, y: number) {
    this.line.push({x, y});
  }

  //Draw lines
  display(ctx: CanvasRenderingContext2D) {
    if(this.line.length > 1) {
      ctx.beginPath();
      const {x, y} = this.line[0];
      ctx.moveTo(x,y);
      for(const {x, y} of this.line) {
        ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
  }
}

//Event that checks for a change in the drawing
const drawingChanged = new Event("drawing-changed");
canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height); //Clear canvas
  for(const line of lines) {
    line.display(ctx);
  }
});

//Event that checks the canvas for mouse click down
canvas.addEventListener("mousedown", (e) => {
  x = e.offsetX; y = e.offsetY;
  isDrawing = true;
  currLine = new CMDDrawLines(); //Create new line object
  currLine.drag(x,y);
  lines.push(currLine);
  redoLines.splice(0, redoLines.length); //Reset redo
  canvas.dispatchEvent(drawingChanged);
});

//Event that checks the canvas for mouse movement
canvas.addEventListener("mousemove", (e) => {
  if(isDrawing) {
    x = e.offsetX; y = e.offsetY;
    currLine.drag(x,y);
    canvas.dispatchEvent(drawingChanged);
  }
});

//Event that checks the canvas for mouse click up
canvas.addEventListener("mouseup", () => {
  if(isDrawing) {
    isDrawing = false;
    canvas.dispatchEvent(drawingChanged);
  }
});

//Event that checks if clear button has been clicked
clearButton.addEventListener("click", function() {
  clearCanvas();
});

//Event that checks if undo button has been clicked
undoButton.addEventListener("click", function() {
  if(lines.length > 0) {
    const line = lines.pop(); //Remove last line from lines
    if (line) {
      redoLines.push(line); //Add erased line to redo
      canvas.dispatchEvent(drawingChanged);
    }
  }
});

//Event that checks if redo button has been clicked
redoButton.addEventListener("click", function() {
  if (redoLines.length > 0) {
    const line = redoLines.pop(); //Remove most current line from redo
    if (line) {
      lines.push(line); //Add to lines to be redrawn
      canvas.dispatchEvent(drawingChanged);
    }
  }
});

//Helper function to clear the canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lines.splice(0, lines.length); //Reset lines
  canvas.dispatchEvent(drawingChanged);
}