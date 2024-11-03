import "./style.css";

const APP_NAME = "Canvas Drawing";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

//Create canvas
const canvas: HTMLCanvasElement = document.createElement("canvas");
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!; //Check that result isn't null
canvas.setAttribute("width", "256");
canvas.setAttribute("height", "256");
app.append(canvas);

 //Set default line color and line width
ctx.strokeStyle = 'black';
ctx.lineWidth = 1;

const emojiDiv = document.createElement("div");
app.append(emojiDiv);

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
lineWidthButton.innerText = "Line Width: 1";
app.append(lineWidthButton);

//Create export button
const exportButton = document.createElement("button");
exportButton.innerText = "Export";
app.append(exportButton);


//Create custom emoji/string button
const emojiButton = document.createElement("button");
emojiButton.innerText = "Custom Emoji";
app.append(emojiButton);

const emojis = [
  {"emoji": "🧂", "button": null as HTMLButtonElement | null},
  {"emoji": "🌠", "button": null as HTMLButtonElement | null},
  {"emoji": "💛", "button": null as HTMLButtonElement | null}
]

function setButtons() {
  for(let i = 0; i < emojis.length; i++) {
    if(!emojis[i].button) {
      emojis[i].button = document.createElement("button");
      emojis[i].button!.innerText = emojis[i].emoji;
      emojiDiv.append(emojis[i].button!);
    }
    emojis[i].button!.addEventListener("click", function() {
      currEmoji = emojis[i].emoji;
      emojiSelected = true;
    });
  }
}
setButtons();


const cursor = {isDrawing: false, x: 0, y:0};
const lines: (drawLinesCmd | drawEmojiCmd)[] = [];
const redoLines: (drawLinesCmd | drawEmojiCmd)[] = [];

let currLine: drawLinesCmd;
let cursorCmd: drawCursorCmd | undefined = undefined;
let emojiCmd: drawEmojiCmd | undefined = undefined;
let emojiSelected: boolean = false;
let currEmoji: string | null = "";
let lineThickness = 1; //Default


class drawEmojiCmd {
  x: number; y:number;
  emoji: string;
  constructor(x:number, y:number, emoji:string) {
    this.x = x; this.y = y;
    this.emoji = emoji;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.fillText(this.emoji, this.x, this.y);
  }

  drag(x:number, y:number) {
    this.x = x;
    this.y = y;
  }
}

class drawCursorCmd {
  x:number; y:number;
  constructor(x:number,y:number) {
    this.x = x; this.y = y;
  }

  display(ctx: CanvasRenderingContext2D, emoji: string) {
    if(emojiSelected) {
      ctx.font = "24px sans-serif";
      ctx.fillText(emoji, this.x, this.y);
    } else {
    ctx.lineWidth = lineThickness;
    ctx.beginPath();
    ctx.arc(this.x, this.y, lineThickness/2, 0 , 2*Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.stroke();
    }
  }
}

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

//Event that check for change in cursor
const toolMoved = new Event("tool-moved");
canvas.addEventListener("tool-moved", redraw.bind(null, ctx));

//Event that checks for a change in the drawing
const drawingChanged = new Event("drawing-changed");
canvas.addEventListener("drawing-changed", redraw.bind(null, ctx));

//Event that checks if mouse has entered bounds of the canvas
canvas.addEventListener("mouseenter", (e) => {
  cursorCmd = new drawCursorCmd(e.offsetX, e.offsetY);
  canvas.dispatchEvent(toolMoved);
});

//Event that checks if mouse has exited bounds of the canvas
canvas.addEventListener("mouseleave", () => {
  cursorCmd = undefined;
  canvas.dispatchEvent(toolMoved);
});

//Event that checks the canvas for mouse click down
canvas.addEventListener("mousedown", (e) => {
  cursor.x = e.offsetX; cursor.y = e.offsetY;
  cursorCmd = undefined;
  canvas.dispatchEvent(toolMoved);
  if (emojiSelected) { //Display selected emoji as cursor
    emojiCmd = new drawEmojiCmd(cursor.x, cursor.y, currEmoji!);
    emojiCmd.drag(cursor.x, cursor.y);
    lines.push(emojiCmd);
  } else { //Display circle of line width as cursor
    cursor.isDrawing = true;
    currLine = new drawLinesCmd(lineThickness); //Create new line object
    currLine.drag(cursor.x,cursor.y);
    lines.push(currLine);
  }
  redoLines.splice(0, redoLines.length); //Reset redo
  canvas.dispatchEvent(drawingChanged);
});

//Event that checks the canvas for mouse movement
canvas.addEventListener("mousemove", (e) => {
  canvas.dispatchEvent(toolMoved);
  if(cursor.isDrawing) {
    cursor.x = e.offsetX; cursor.y = e.offsetY;
    currLine.drag(cursor.x,cursor.y);
    canvas.dispatchEvent(drawingChanged);
  } else {
    cursorCmd = new drawCursorCmd(e.offsetX, e.offsetY);
    canvas.dispatchEvent(toolMoved);
  }
});

canvas.addEventListener("mouseup", (e) => {
  cursorCmd = new drawCursorCmd(e.offsetX, e.offsetY);
  if(cursor.isDrawing) {
    cursor.isDrawing = false;
    canvas.dispatchEvent(drawingChanged);
  }
});

clearButton.addEventListener("click", function() {
  clearCanvas();
});

undoButton.addEventListener("click", function() {
  if(lines.length > 0) {
    const line = lines.pop(); //Remove last line from lines
    if (line) {
      redoLines.push(line); //Add erased line to redo
      canvas.dispatchEvent(drawingChanged);
    }
  }
});

redoButton.addEventListener("click", function() {
  if (redoLines.length > 0) {
    const line = redoLines.pop(); //Remove most current line from redo
    if (line) {
      lines.push(line); //Add to lines to be redrawn
      canvas.dispatchEvent(drawingChanged);
    }
  }
});

//Change line width when button is clicked
//1 = thin, 10 = thick
lineWidthButton.addEventListener("click", function() {
  emojiCmd = undefined;
  emojiSelected = false;
  if (lineThickness == 1) {
    lineThickness = 10;
  } else {
    lineThickness = 1;
  }
  lineWidthButton.innerText = `Line Width: ${lineThickness}`;
});

emojiButton.addEventListener("click", function() {
  currEmoji = prompt("Custom sticker text", ""); //Select custom string
  emojiSelected = true;
  emojis.push({"emoji": currEmoji!, "button": null}); //Add custom emoji button
  setButtons();
});

exportButton.addEventListener("click", function() {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportctx = exportCanvas.getContext("2d")!;
  exportctx.scale(exportCanvas.width/canvas.width, exportCanvas.height/canvas.height);

  redraw(exportctx);

  const anchor = document.createElement("a");
  anchor.href = canvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
});


//Helper function to redraw the canvas and cursor
function redraw(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, canvas.width, canvas.height); //Clear canvas
  for(const line of lines) { //Redraw valid lines
    line.display(ctx);
  }

  if(cursorCmd) { //Check if cursor is valid and needs to be shown
    if (emojiSelected) {
      cursorCmd.display(ctx, currEmoji!);
    } else {
      cursorCmd.display(ctx, "");
    }
  }
}

//Helper function to clear the canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lines.splice(0, lines.length); //Reset lines
  currEmoji = ""; //Reset to empty string
  canvas.dispatchEvent(drawingChanged);
}