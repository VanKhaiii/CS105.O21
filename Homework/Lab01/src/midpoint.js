
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var width = 800;
var height = 600;

var bgRgba = [240, 240, 200, 255];
var pointRgba = [0, 0, 255, 255];
var lineRgba = [0, 0, 0, 255];
var vlineRgba = [255, 0, 0, 255];

var state = 0;

canvas.setAttribute("width", width);
canvas.setAttribute("height", height);

function Painter(context, width, height) {
    this.context = context;
    this.imageData = context.createImageData(width, height);
    this.linePoints = []; // p0, p1 -> p2, p3 ...
    this.circlePoints = []; // c0, r0 -> c1, r1 ...
    this.prevPoint = [];
    this.width = width;
    this.height = height;

    this.getPixelIndex = function(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
        return -1;
        return (x + y * width) << 2;
    }

    this.setPixel = function(x, y, rgba) {
        pixelIndex = this.getPixelIndex(x, y);
        if (pixelIndex == -1) return;
        for (var i = 0; i < 4; i++) {
        this.imageData.data[pixelIndex + i] = rgba[i];
        }
    }

    this.drawPoint = function(p, rgba){
        var x = p[0];
        var y = p[1];
        for (var i = -1; i <= 1; i++)
        for (var j = -1; j <= 1; j++)
            this.setPixel(x + i, y + j, rgba);
    }

    // Function to draw a circle using midpoint algorithm
    this.drawCircle = function(center, radius) {
        var x = 0;
        var y = radius;
        var p = 1 - radius;

        this.setPixel(center[0], center[1] + y, lineRgba);
        this.setPixel(center[0], center[1] - y, lineRgba);
        this.setPixel(center[0] + y, center[1], lineRgba);
        this.setPixel(center[0] - y, center[1], lineRgba);
        
        while (x < y) {
        if (p < 0) {
            p += 2 * x + 3;
        } else {
            p += 2 * (x - y) + 5;
            y--;
        }
        x++;

        this.setPixel(center[0] + x, center[1] + y, lineRgba);
        this.setPixel(center[0] + x, center[1] - y, lineRgba);
        this.setPixel(center[0] - x, center[1] + y, lineRgba);
        this.setPixel(center[0] - x, center[1] - y, lineRgba);
        this.setPixel(center[0] + y, center[1] + x, lineRgba);
        this.setPixel(center[0] + y, center[1] - x, lineRgba);
        this.setPixel(center[0] - y, center[1] + x, lineRgba);
        this.setPixel(center[0] - y, center[1] - x, lineRgba);
        }
    }
    
    this.drawLineBresenham = function(p0, p1, rgba) {
        const dx = Math.abs(p1[0] - p0[0]);
        const dy = Math.abs(p1[1] - p0[1]);
        const sx = p0[0] < p1[0] ? 1 : -1;
        const sy = p0[1] < p1[1] ? 1 : -1;
        let err = dx - dy;
    
        let x = p0[0];
        let y = p0[1];
    
        while (x !== p1[0] || y !== p1[1]) {
            this.setPixel(x, y, rgba);
            const err2 = err * 2;
            if (err2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (err2 < dx) {
                err += dx;
                y += sy;
            }
        }
    }
    
    // this.drawLineBresenham = function(p) {
    //     var n = this.points.length;
    //     this.drawBkg(bgRgba);
    //     for (var i = 0; i < n; i++)
    //         this.drawPoint(this.points[i], pointRgba);
    //     for (var i = 0; i < n - 1; i++)
    //         this._bresenhamLine(this.points[i], this.points[i + 1], lineRgba);
    //     if (n > 0 && (this.points[n - 1][0] != p[0] || this.points[n - 1][1] != p[1])) {
    //         this._bresenhamLine(this.points[n - 1], p, vlineRgba);
    //     }
    //     this.context.putImageData(this.imageData, 0, 0);
    // }
    
    this.drawLineDDA = function(p0, p1, rgba) {
        var x0 = p0[0], y0 = p0[1];
        var x1 = p1[0], y1 = p1[1];
        var dx = x1 - x0, dy = y1 - y0;
        if (dx == 0 && dy == 0)
            return;
        if (Math.abs(dy) <= Math.abs(dx)) {
            if (x1 < x0) {
                var tx = x0; x0 = x1; x1 = tx;
                var ty = y0; y0 = y1; y1 = ty;
            }
            var k = dy / dx;
            var y = y0;
            for (var x = x0; x <= x1; x++) {
                this.setPixel(x, Math.floor(y + 0.5), rgba);
                y = y + k;
            }
        }
        else {
            if (y1 < y0) {
                var tx = x0; x0 = x1; x1 = tx;
                var ty = y0; y0 = y1; y1 = ty;
            }
            var k = dx / dy;
            var x = x0;
            for (var y = y0; y <= y1; y++) {
                this.setPixel(Math.floor(x + 0.5), y, rgba);
                x = x + k;
            }
        }
    }
    
    // this.drawLineDDA = function(p) {
    //     var n = this.points.length;
    //     this.drawBkg(bgRgba);
    //     for (var i = 0; i < n; i++)
    //         this.drawPoint(this.points[i], pointRgba);
    //     for (var i = 0; i < n - 1; i++)
    //         this.ddaLine(this.points[i], this.points[i + 1], lineRgba);
    //     if (n > 0 && (this.points[n - 1][0] != p[0] || this.points[n - 1][1] != p[1])) {
    //         this.ddaLine(this.points[n - 1], p, vlineRgba);
    //     }
    //     this.context.putImageData(this.imageData, 0, 0);
    // }

    this.drawBkg = function(rgba) {
        for (var i = 0; i < this.width; i++)
        for (var j = 0; j < this.height; j++)
            this.setPixel(i, j, rgba);
    }

    this.clear = function() {
        this.circlePoints.length = 0;
        this.linePoints.length = 0;
        this.drawBkg(bgRgba);
        this.context.putImageData(this.imageData, 0, 0);
    }

    this.draw = function(p, type) {
        // Draw background
        this.drawBkg(bgRgba);

        // Draw lines
        var lpLengths = this.linePoints.length;
        console.log(lpLengths)

        for (var i = 0; i < lpLengths; i+=2) {
            this.drawPoint(this.linePoints[i], pointRgba);
            this.drawPoint(this.linePoints[i + 1], pointRgba);
            this.drawLineBresenham(this.linePoints[i], this.linePoints[i + 1], lineRgba);
        }
  
        // Drarw circles
        var cpLengths = this.circlePoints.length;

        for (var i = 0; i < cpLengths; i+=2) {
            this.drawPoint(this.circlePoints[i], pointRgba);
            this.drawCircle(this.circlePoints[i], this.circlePoints[i + 1]);
        }

        // Draw mouse move
        if (p) {
            this.drawPoint(this.prevPoint, pointRgba);

            if (type == 'dda') {
                // Them code
                this.drawLineDDA(this.prevPoint, p, lineRgba);
            }
            else if (type == 'bresenham') {
                // Them code 
                this.drawLineBresenham(this.prevPoint, p, lineRgba);
            }
            else {
                // Calculate r
                const center = this.prevPoint;
                var radius = Math.round(Math.sqrt((p[0] - center[0]) * (p[0] - center[0]) + (p[1] - center[1]) * (p[1] - center[1])));
                this.drawCircle(center, radius);
            }
        }
        
        this.context.putImageData(this.imageData, 0, 0);
    }
    this.clear();
}

state = 0; 
clickPos = [-1, -1];
const painter = new Painter(context, width, height);

const getPosOnCanvas = function(x, y) {
    var bbox = canvas.getBoundingClientRect();
    return [Math.floor(x - bbox.left * (canvas.width / bbox.width) + 0.5),
        Math.floor(y - bbox.top * (canvas.height / bbox.height) + 0.5)];
}

const doMouseMove = function(e) {
    if (state == 0) return;

    const type = document.querySelector("#algorithm").value;
    var p = getPosOnCanvas(e.clientX, e.clientY);
    painter.draw(p, type);
}       

const doMouseDown = function(e) {
    var p = getPosOnCanvas(e.clientX, e.clientY);
    if (state == 0) {
        painter.prevPoint = p;
        painter.drawPoint(p, pointRgba);
        state = 1;
    }
    else {
        const type = document.querySelector("#algorithm").value;
        console.log(type);
        if (type == 'midpoint') {
            const center = painter.prevPoint;
            var radius = Math.round(Math.sqrt((p[0] - center[0]) * (p[0] - center[0]) + (p[1] - center[1]) * (p[1] - center[1])));
            painter.circlePoints.push(painter.prevPoint, radius);
        }
        else {
            painter.linePoints.push(painter.prevPoint, p);
        }

        state = 0;
        painter.draw(p, type);
    }
}

const doKeyDown = function(e) {
    var keyId = e.keyCode ? e.keyCode : e.which;

    if (keyId == 27) { 
        painter.clear();
        state = 0; 
    }
}

doReset = function() {
    state = 0;
    painter.clear();
}

canvas.addEventListener("mousedown", doMouseDown, false);
canvas.addEventListener("mousemove", doMouseMove, false);
window.addEventListener("keydown", doKeyDown, false);

var resetButton = document.getElementById("reset__");
resetButton.addEventListener("click", doReset, false);