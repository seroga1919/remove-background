// Constructor for rectangular shaped object
function rectShape(xywh) {
    this.x = xywh[0] || 0;
    this.y = xywh[1] || 0;
    this.w = xywh[2] || 1;
    this.h = xywh[3] || 1;
    // this.fill = fill || '#e55039';
}

// Draws the rectangle on canvas
rectShape.prototype.draw = function(ctx) {
    // ctx.fillStyle = this.fill;
    ctx.fillStyle = '#0EF24766';
    ctx.fillRect(this.x, this.y, this.w, this.h);
}
  
// Determine if a point already exists inside any rectangle
rectShape.prototype.contains = function(mx, my) {
    return  (this.x <= mx) && (this.x + this.w >= mx) &&
            (this.y <= my) && (this.y + this.h >= my);
}

var cState = null;
// To maintain the state of canvas
function canvaState(canvas, imageObj, img_name, ind) {
    this.imageObj = imageObj;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
       
    this.width = canvas.width;
    this.height = canvas.height; 
    this.img_name = img_name;
    this.ind = ind;

    // this.width = canvas.width;
    // this.height = canvas.height;
    
    var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
    //To get the values of padding & border size which contribute towards mouse position
    if (document.defaultView && document.defaultView.getComputedStyle) {
      this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
      this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
      this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
      this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
    }
    //For pages with fixed-position bars
    var html = document.body.parentNode;
    this.htmlTop = html.offsetTop;
    this.htmlLeft = html.offsetLeft;
    
    // variables to store canvas state information
    this.isValid = false; // canvas will redraw everything until it is valid
    this.shapes = [];  // array to store all the rectangles created
    this.draggingOld = false; // true if already existing rectangle is dragged
    this.draggingNew = false; // true if a new rectangle is being created
    this.isDragged = false; // true if clicked & dragged to create a new rectangle
    this.selection = null;  // store the info of selected rectangle
    this.mouseX = 0; // to store mouse position when dragged
    this.mouseY = 0;
    this.newRect = {w:0 , h:0}; //if new rectangle is to be created
    this.randomColour = '#000';
    // this.page_name = img_name.substring(img_name.length-4,0) + `_page_${ind}.jpg`;
    // this.sub_detect_table = {};
    // this.sub_detect_table[this.page_name] = [];
    
    cState = this; // To store a reference to current canvas
    cState.randomColour = randomColor(); //random generated color for the first rectangle

    // To remove any default behaviour of elements
    this.canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
    // event listener : when mouse button is pressed
    this.canvas.addEventListener('mousedown', mouseDown, true);
    // event listener : mouse button is pressses & dragged
    this.canvas.addEventListener('mousemove', mouseMove, false);
    // event listener : mouse button is released
    this.canvas.addEventListener('mouseup', mouseUp, false);
    // event listener : double click to delete a shape
    this.canvas.addEventListener('dblclick', Dblclick, false);
    
    // To denote the selected rectangle
    this.selectionColor = '#eb2f06';
    this.selectionWidth = 2;  
    this.interval = 30;
    setInterval(function() { cState.draw(); }, cState.interval);
}

function mouseDown(e) {
    var mouse = cState.getMouse(e);
    var mx = mouse.x;
    var my = mouse.y;
    var shapes = cState.shapes;
    var l = shapes.length;
    if(!cState.draggingNew){
        for (var i = l-1; i >= 0; i--) {
            if (shapes[i].contains(mx, my)) {
                var mySel = shapes[i];          //if the mouse point is on already existing rectange, select the rectange
                cState.mouseX = mx - mySel.x;
                cState.mouseY = my - mySel.y;
                cState.draggingOld = true;
                cState.selection = mySel;
                cState.isValid = false;
                return;
            }
        }
    }
    cState.mouseX = mx;    // begining position for the new rectangle shape
    cState.mouseY = my;
    cState.draggingNew = true;
    return; 
}
function mouseUp(e) {
    var mouse = cState.getMouse(e);
    
    if (cState.isDragged) { // If clicked on free surface & dragged, then only create the rectangle
        if(cState.newRect.w < 0){
            cState.newRect.w = Math.abs(cState.newRect.w);
            cState.mouseX = cState.mouseX - cState.newRect.w;
        }
        if(cState.newRect.h < 0){
            cState.newRect.h = Math.abs(cState.newRect.h);
            cState.mouseY = cState.mouseY - cState.newRect.h;
        }
        if (cState.img_name.substring(cState.img_name.length-3)=="pdf") {
            let page_name = cState.img_name.substring(cState.img_name.length-4,0) + `_page_${cState.ind}.jpg`;
            detect_table[cState.img_name][page_name].push([cState.mouseX, cState.mouseY, cState.newRect.w, cState.newRect.h]);
        } else {
            try {
                detect_table[cState.img_name].push([cState.mouseX, cState.mouseY, cState.newRect.w, cState.newRect.h]);
            } catch {
                let pdf_name = cState.img_name.split('_page_')[0] + ".pdf";
                detect_table[pdf_name][cState.img_name].push([cState.mouseX, cState.mouseY, cState.newRect.w, cState.newRect.h]);
            }
            
        }
        
        cState.addShape(new rectShape([cState.mouseX, cState.mouseY, cState.newRect.w, cState.newRect.h]));
    }
    cState.randomColour = randomColor();    //To generate new random color for next rectangle
    cState.draggingOld = false;
    cState.draggingNew = false;
    cState.isDragged = false;
    cState.selection = null;   // If there was an object selected, we deselect it to clear the old selection border
}
function mouseMove(e) {
    var mouse = cState.getMouse(e);
    if (cState.draggingOld){    // if already existing rectangle is dragged
        cState.selection.x = mouse.x - cState.mouseX;
        cState.selection.y = mouse.y - cState.mouseY;   
        cState.isValid = false; // to redraw the rectangle
    }
    if (cState.draggingNew) {   // creating a pseudo rectangle
        cState.ctx.clearRect(0, 0, 800, 400); // recreate all the shapes to delete previous pseudo rectangles
        cState.ctx.drawImage(cState.imageObj, 0, 0, cState.width, cState.height);
        cState.isValid = false;
        cState.draw();
        cState.newRect.w = mouse.x - cState.mouseX;
        cState.newRect.h = mouse.y - cState.mouseY;
        cState.ctx.fillStyle = cState.randomColour;

        cState.ctx.fillRect(cState.mouseX, cState.mouseY, cState.newRect.w, cState.newRect.h, cState.randomColour);
        cState.isDragged = true;
    }
}
function Dblclick(e) {
    var mouse = cState.getMouse(e);
    var shapes = cState.shapes;
    var l = shapes.length;
    for (var i = l-1; i >= 0; i--) {
        if (cState.shapes[i].contains(mouse.x, mouse.y)) {
            cState.shapes[i] = cState.shapes[l-1];
            cState.shapes.pop();
            
            if (cState.img_name.substring(cState.img_name.length-3)=="pdf") {
                let page_name = cState.img_name.substring(cState.img_name.length-4,0) + `_page_${cState.ind}.jpg`;
                detect_table[cState.img_name][page_name].pop();
            } else {
                detect_table[cState.img_name].pop();
            }

            cState.isValid = false;
            // cState.draw();
            return;
        }
    }
}
//To push new rectangle into shapes array
canvaState.prototype.addShape = function(shape) {
    this.shapes.push(shape);
    this.isValid = false;

}
  
//clear canvas to redraw modified/new rectangle alog with all other rectangle
canvaState.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
}
  
// To draw the rectangles in shapes array whenever the position of existing rectangle changes or new rectangle is added
canvaState.prototype.draw = function() {
    if (!this.isValid) {
        var ctx = this.ctx;
        var shapes = this.shapes;
        this.clear();
        ctx.drawImage(this.imageObj, 0, 0, this.width, this.height);
        var l = shapes.length;
        for (var i = 0; i < l; i++) {
            var shape = shapes[i];
            // skipping the drawing of elements off the screen
            if (shape.x > this.width || shape.y > this.height || shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
            shapes[i].draw(ctx);
        }
        
        if (this.selection != null) {    // selection area
            ctx.strokeStyle = this.selectionColor;
            ctx.lineWidth = this.selectionWidth;
            var mySel = this.selection;
            ctx.strokeRect(mySel.x,mySel.y,mySel.w,mySel.h);
        }
        this.isValid = true;
    }
}

canvaState.prototype.getMouse = function(e) {   // to give the exact mouse location calculating padding, margin etc
    var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;
    //total offset calculated
    if (element.offsetParent !== undefined) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }
    //adding border, padding & fixed bar values
    offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
    offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

    mx = e.pageX - offsetX;
    my = e.pageY - offsetY;
    return {x: mx, y: my}; //returning actual position of mouse
}

/* Function to create random color */

function randomColor() {
    var digits = '0123456789ABCDEF'; //hex digits
    var colorValue = '#';
    for (var i = 0; i < 6; i++) {
      colorValue += digits[Math.floor(Math.random() * 16)];
    }
    let opacity = 0.4;
    const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return colorValue + _opacity.toString(16).toUpperCase();
}

/* To initiate the canvas state on page load */
// function show_img(img_name, extension, ind) {

function init() {
    var canvas = document.getElementById('canvas');
    var s = null;
    ctx = canvas.getContext('2d');

    imageObj = new Image();
    imageObj.src="4.jpg";

    imageObj.onload = function () { 
        w = 500;
        h = 400;
        canvas.width = w;
        canvas.height = h; 
        // s = new canvaState(canvas,imageObj); 
        ctx.drawImage(imageObj, 0, 0, w, h);
        
    }; 

    /* To Clear the Canvas */
    document.getElementById('clear').onclick = function (){
        s.shapes = [];
        s.isValid = false;
        //s.addShape(new rectShape(-10, -20, 20, 20, '#fff'));
        s.draw();
    }
}
