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

 //Set default line color and line width
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

//Create line width button
const lineWidthButton = document.createElement("button");
lineWidthButton.innerText = `Line Width: ${ctx.lineWidth}`;
app.append(lineWidthButton);

const cursor = {isDrawing: false, x: 0, y:0};
const lines: drawLinesCmd[] = [];
const redoLines: drawLinesCmd[] = [];
let currLine: drawLinesCmd;

/*
class drawCursorCmd {
  display(x:number, y:number) {
    ctx.font = `${currLine.lineWidth*5}px monospace`;
    ctx.fillText("•", x-8, y+11);
  }
}
const cursorCmd = new drawCursorCmd();
*/

class drawLinesCmd {
  line: {x: number, y: number}[] = [];
  lineWidth: number;

  constructor(width: number) {
    this.lineWidth = width;
  }

  //Add points to line
  drag(x: number, y: number) {
    this.line.push({x, y});
  }

  //Draw lines
  display(ctx: CanvasRenderingContext2D) {
    if(this.line.length > 1) {
      ctx.beginPath();
      ctx.lineWidth = this.lineWidth;
      const {x, y} = this.line[0];
      ctx.moveTo(x,y);
      for(const {x, y} of this.line) {
        ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
  }
}

const toolMoved = new Event("tool-moved");

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
  cursor.x = e.offsetX; cursor.y = e.offsetY;
  cursor.isDrawing = true;
  currLine = new drawLinesCmd(ctx.lineWidth); //Create new line object
  currLine.drag(cursor.x,cursor.y);
  lines.push(currLine);
  redoLines.splice(0, redoLines.length); //Reset redo
  canvas.dispatchEvent(drawingChanged);
});

//Event that checks the canvas for mouse movement
canvas.addEventListener("mousemove", (e) => {
  if(cursor.isDrawing) {
    cursor.x = e.offsetX; cursor.y = e.offsetY;
    currLine.drag(cursor.x,cursor.y);
    canvas.dispatchEvent(drawingChanged);
    canvas.dispatchEvent(toolMoved);
  }
});

//Event that checks the canvas for mouse click up
canvas.addEventListener("mouseup", () => {
  if(cursor.isDrawing) {
    cursor.isDrawing = false;
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

lineWidthButton.addEventListener("click", function() {
  if (ctx.lineWidth == 1) {
    ctx.lineWidth = 10;
  } else {
    ctx.lineWidth = 1;
  }
  lineWidthButton.innerText = `Line Width: ${ctx.lineWidth}`;
});

//Helper function to clear the canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lines.splice(0, lines.length); //Reset lines
  canvas.dispatchEvent(drawingChanged);
}