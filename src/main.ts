import "./style.css";

const APP_NAME = "Hello!";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
//app.innerHTML = APP_NAME;

const appTitle = document.createElement("h1");

const canvas: HTMLCanvasElement = document.createElement('canvas');
const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!; //Check that result isn't null

app.append(canvas);
