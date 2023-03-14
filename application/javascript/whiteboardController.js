import { socket } from "./room.js";
// initialize canvas element
const canvases = document.querySelectorAll(".canvas");
const prevPageBtn = document.querySelector("#prev-page-btn");
const nextPageBtn = document.querySelector("#next-page-btn");
const currentPageEl = document.querySelector("#current-page");
const whiteboardCloseBtn = document.querySelector(".whiteboard__close");

let currentPage = 1;
let currentCanvasId;
let drawing = false;
let lastX = 0;
let lastY = 0;
let hue = 0; 
let lightness = "60%";
let lineWidth = 1;
const maxPages = 5;
function initWhiteboard(myUserId){
    canvases.forEach(canvas => {
        canvas.width = 1120;
        canvas.height = 620;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        canvas.addEventListener("mousedown", (e) => {
            currentCanvasId = canvas.id;
            lastX = e.offsetX;
            lastY = e.offsetY;
            drawing = true;
        });
    
        canvas.addEventListener("mousemove", (e) => {
            if(drawing){
                draw(lastX, lastY, e.offsetX, e.offsetY, `hsl(${hue}, 100%, ${lightness})`, lineWidth, ctx, currentCanvasId, myUserId);
                lastX = e.offsetX;
                lastY = e.offsetY;
            }
        });
    
        canvas.addEventListener("mouseup", () => {
            drawing = false;
        });
    
        canvas.addEventListener("mouseout", () => {
            drawing = false;
        });
    });
    
    socket.on("drawToRemote", (data) => {
        if(data.userId !== myUserId){
            const canvas = document.getElementById(data.canvasId);
            const ctx = canvas.getContext("2d");
            draw(data.lastX, data.lastY, data.x, data.y, data.color, data.lineWidth, ctx, data.canvasId, data.userId);
        }
    });
    
    // draw function to draw lines on canvas
    function draw(lastX, lastY, x, y, color = `hsl(${hue}, 100%, ${lightness})`, lineWidth = 1, ctx, canvasId, userId) {
        ctx.beginPath(); 
        ctx.moveTo(lastX, lastY); 
        ctx.lineTo(x, y); 
        ctx.strokeStyle = color; 
        ctx.lineWidth = lineWidth; 
        ctx.lineCap = "round";
        ctx.stroke(); 
        const data = { lastX, lastY, x, y, color, lineWidth, canvasId, userId};
        socket.emit("draw", data);
    }
    /*-----------------------------------------control canvas pages-----------------------------------------------*/
    prevPageBtn.style.opacity = 0.3;
    prevPageBtn.style.cursor = "default"
    prevPageBtn.addEventListener("click", () => {
        if(currentPage > 1){
            currentPage--;
            showCanvas(currentPage);
        }
        prevPageBtn.style.opacity = currentPage === 1 ? 0.3 : 1;
        prevPageBtn.style.cursor = currentPage === 1 ? "default" : "pointer";
        nextPageBtn.style.opacity = currentPage === 5 ? 0.3 : 1;
        nextPageBtn.style.cursor = currentPage === 5 ? "default" : "pointer";
    });
    
    nextPageBtn.addEventListener("click", () => {
        if(currentPage < maxPages){
            currentPage++;
            showCanvas(currentPage);
        }
        prevPageBtn.style.opacity = currentPage === 1 ? 0.3 : 1;
        prevPageBtn.style.cursor = currentPage === 1 ? "default" : "pointer";
        nextPageBtn.style.opacity = currentPage === 5 ? 0.3 : 1;
        nextPageBtn.style.cursor = currentPage === 5 ? "default" : "pointer";
    });
      
    function showCanvas(page) {
        const activeCanvas = document.querySelector(".canvas.active");
        activeCanvas.classList.remove("active");
        const newActiveCanvas = document.querySelector(`#canvas${page}`);
        newActiveCanvas.classList.add("active");
        currentPageEl.textContent = `Page ${page}`;
    }
    showCanvas(currentPage);
    
    /*-----------------------------------------toolsBar-----------------------------------------------*/
    /*-----------------------------------------palette-----------------------------------------------*/
    const tools = document.querySelectorAll(".tools");
    const palette = document.querySelector(".palette");
    const paletteMenu = document.querySelector(".palette__menu");
    const colors = document.querySelectorAll(".color");
    palette.addEventListener("click", () =>{
        tools.forEach(tool => {
            tool.style.backgroundColor = "";
        });
        palette.style.backgroundColor = "#dadada";
        paletteMenu.style.display = "flex";
    })
    
    let currentCursorColor = "red";
    let lightnessValue;
    colors.forEach(color => {
        color.addEventListener("click", (e) => {
            hue = parseInt(e.target.getAttribute("hue"));
            lightnessValue = e.target.getAttribute("lightness");
            if(lightnessValue){
                lightness = lightnessValue;
            }
            else{
                lightness = "60%"
            };
            currentCursorColor = e.target.classList[1];
            updateCursor();
            paletteMenu.style.display = "none";
            canvases.forEach(canvas => {
                const ctx = canvas.getContext("2d");
                ctx.strokeStyle = `hsl(${hue}, 100%, ${lightness})`;
            });
        });
    });
    
    function updateCursor(){
        canvases.forEach(canvas => {
            canvas.classList.remove("red_cursor", "orange_cursor", "yellow_cursor", "green_cursor", "blue_cursor", "purple_cursor", "black_cursor", "eraser_cursor", "text_cursor");
            canvas.classList.add(`${currentCursorColor}_cursor`);
        });
    }
    
    canvases.forEach(canvas => {
        canvas.addEventListener("click", () => {
            paletteMenu.style.display = "none";
            penStrokeMenu.style.display = "none";
            tools.forEach(tool => {
                tool.style.backgroundColor = "";
            });
        });
    });
    
    document.addEventListener("click", (e) => {
        if(!palette.contains(e.target) && !paletteMenu.contains(e.target)){
            palette.style.backgroundColor = "transparent";
            paletteMenu.style.display = "none";
        }
    });
    
    /*-----------------------------------------stroke-----------------------------------------------*/
    const penStroke = document.querySelector(".penStroke");
    const penStrokeMenu = document.querySelector(".penStroke__menu");
    const penStrokeSizes = document.querySelectorAll(".penStrokeSize")
    
    penStroke.addEventListener("click", () => {
        tools.forEach(tool => {
            tool.style.backgroundColor = "";
        });
        penStroke.style.backgroundColor = "#dadada";
        penStrokeMenu.style.display = "flex";
        paletteMenu.style.display = "none";
    });
    
    penStrokeSizes.forEach(penStrokeSize => {
        penStrokeSize.addEventListener("click", (e) => {
            lineWidth = parseInt(e.target.getAttribute("lineWidth"));
            paletteMenu.style.display = "none";
        });
    });
    
    document.addEventListener("click", (e) => {
        if(!penStroke.contains(e.target) && !penStrokeMenu.contains(e.target)){
            penStroke.style.backgroundColor = "transparent";
            penStrokeMenu.style.display = "none";
        }
    });
    /*-----------------------------------------eraser-----------------------------------------------*/
    const eraser = document.querySelector(".eraser");
    eraser.addEventListener("click", () => {
        tools.forEach(tool => {
            tool.style.backgroundColor = "";
        });
        eraser.style.backgroundColor = "#dadada";
        lightness = "100%"
        lineWidth = 20
        currentCursorColor = "eraser";
        updateCursor();
    });
    
    /*-----------------------------------------clear-----------------------------------------------*/
    const clearBtn = document.querySelector(".clear-btn");
    clearBtn.addEventListener("click", () => {
        const canvas = document.querySelector(".canvas.active");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        socket.emit("clearCanvas", {canvasId: canvas.id});
    });
    
    socket.on("updateCanvas", (data) => {
        const canvas = document.getElementById(data.canvasId);
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    whiteboardCloseBtn.addEventListener("click", () => {
        whiteboard.style.display = "none"
    })
}

export default {
    initWhiteboard,
}