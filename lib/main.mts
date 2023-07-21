
type Points = Array<number>;//TODO: should be exactly 2 elements...
//private functions
class Rectangle{
    x:number;
    y:number;
    w:number;
    h:number;
	grid:Array<Points>;
	constructor (x:number, y:number, w:number, h:number) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
        this.grid = [];
		for (let x_ = 0; x_ < this.w; x_++) {
			for (let y_ = 0; y_ < this.h; y_++) {
				this.grid.push([this.x + x_, this.y + y_]);
			}
		}
	}
}
class Bitmap{
    imageData:ImageData;
    height:number;width:number;
    x:number;y:number;
    constructor (imageData:ImageData) {
        this.imageData = imageData;
        this.height = this.imageData.height;
        this.width = this.imageData.width;
        this.x = 0;
        this.y = 0;
    }
    fillColor(r:number, g:number, b:number, a:number) {
        for (let x = 0; x < this.imageData.width; x++) {
            for (let y = 0; y < this.imageData.height; y++) {
                // Index of the pixel in the array
                const idx = (x + y * this.width) * 4;
                this.imageData.data[idx + 0] = r;
                this.imageData.data[idx + 1] = g;
                this.imageData.data[idx + 2] = b;
                this.imageData.data[idx + 3] = a;
            }
        }
    }
    hitTest(rect:Rectangle) {
        const color = "RGBA(0,255,0,255)";
        for (let i = 0; i < rect.grid.length; i++) {
            const x = rect.grid[i][0];
            const y = rect.grid[i][1];
            const pixel = get_pixel(x, y, this.imageData, -this.x, -this.y);
            if (pixel === color) return true;
        }
        return false;
    }
}
const get_pixel = (x:number, y:number, canvasData:ImageData, offsetX:number, offsetY:number)=> {
    x = x + offsetX;
    y = y + offsetY;
    if (x < 0 || y < 0 || x > canvasData.width || y > canvasData.height) return;
    const r = (y * canvasData.width + x) * 4;
    const g = (y * canvasData.width + x) * 4 + 1;
    const b = (y * canvasData.width + x) * 4 + 2;
    const a = (y * canvasData.width + x) * 4 + 3;
    return "RGBA(" + canvasData.data[r] + "," + canvasData.data[g] + "," + canvasData.data[b] + "," + canvasData.data[a] + ")";
}
class WORMS{
    ctx:CanvasRenderingContext2D;
    width:number;
    height:number;
    canvases:Record<string,CanvasRenderingContext2D>;
    terrain_bmp:Bitmap;
    character_bmp:Bitmap;
    jumping:Boolean;
    left_key:Boolean;right_key:Boolean;space_key:Boolean;
    keys:Array<string>;
    character_speed:number;
    constructor(canvas:HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;
        this.canvases = {};
        const terrain_bmpd = this.ctx.createImageData(300, 150);
        this.terrain_bmp = new Bitmap(terrain_bmpd);
        this.terrain_bmp.fillColor(0, 255, 0, 255);
        const character_bmpd = this.ctx.createImageData(10, 20);
        this.character_bmp = new Bitmap(character_bmpd);
        this.character_bmp.fillColor(255, 0, 0, 255);
        document.onkeydown = this.key_down;
        document.onkeyup = this.key_up;
        document.onmouseup = this.mouse_up;
        this.jumping = false;
        this.left_key = false;
        this.right_key = false;
        this.space_key = false;
        this.keys = [];
        this.character_speed = 0;
    }
    init(){
        this.init_objects(); //init the objects
        this.updateLoop();
        this.renderLoop();
    }
    init_objects() {
        this.terrain_bmp.y = this.height - this.terrain_bmp.height;
        this.add_child("terrain", this.terrain_bmp);
        this.character_bmp.x = 100;
        this.character_bmp.y = 20;
        this.add_child("character", this.character_bmp);
        this.draw_objects();
    }
    updateLoop() {
        this.move_character();
        setTimeout(function () {
            wormsInstance.updateLoop();
        }, 1000 / 30); //the loop
    }
    renderLoop() {
        wormsInstance.canvases.character.clearRect(0, 0, wormsInstance.width, wormsInstance.height);
        wormsInstance.canvases.character.putImageData(wormsInstance.character_bmp.imageData, wormsInstance.character_bmp.x, wormsInstance.character_bmp.y);
        wormsInstance.draw_objects();
        window.requestAnimationFrame(wormsInstance.renderLoop);
    }
    draw_objects() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        for (let key in this.canvases) {
            const obj = this.canvases[key];
            // put the pieces together
            if (obj) this.ctx.drawImage(obj.canvas, 0, 0);
        }
    }
    add_child(temp_name:string, bitmap:Bitmap) {
        //stores the canvases in temporary obj to manipulate later
        const buffer = document.createElement('canvas');
        buffer.height = this.height;
        buffer.width = this.width;
        const ctx = buffer.getContext("2d");
        ctx.putImageData(bitmap.imageData, bitmap.x, bitmap.y)
        this.canvases[temp_name] = ctx;
    }
    move_character() {
        let i = 0;
        for (i = 0; i < 3; i++) {    
            if (this.left_key) {
                if (!this.terrain_bmp.hitTest(new Rectangle(this.character_bmp.x , this.character_bmp.y, 1, 1))) {
                    this.character_bmp.x -= 1;
                }
                while (this.terrain_bmp.hitTest(new Rectangle(this.character_bmp.x, this.character_bmp.y + 20, 10, 1))) {
                    this.character_bmp.y -= 1;
                }
            }
            if (this.right_key) {
                if (!this.terrain_bmp.hitTest(new Rectangle(this.character_bmp.x + 10, this.character_bmp.y, 1, 1))) {
                    this.character_bmp.x += 1;
                }
                while (this.terrain_bmp.hitTest(new Rectangle(this.character_bmp.x, this.character_bmp.y + 20, 10, 1))) {
                    this.character_bmp.y -= 1;
                }
            }
        }
        if (this.space_key && !this.jumping) {
            this.character_speed = -10;
            this.jumping = true;
        }
        this.character_speed++; //is this going to work prooperly?
        if (this.character_speed > 0) {
            //check ground
            for (i = 0; i < this.character_speed; i++) {
                if (!this.terrain_bmp.hitTest(new Rectangle(this.character_bmp.x, this.character_bmp.y + 20, 10, 1))) {
                    this.character_bmp.y += 1;
                } else {
                    this.jumping = false;
                    this.character_speed = 0;
                }
            }
        } else {
            for (i = 0; i < Math.abs(this.character_speed); i++) {
                if (!this.terrain_bmp.hitTest(new Rectangle(this.character_bmp.x, this.character_bmp.y, 10, 1))) {
                    this.character_bmp.y -= 1;
                } else {
                    this.character_speed = 0;
                }
            }
        }
    }
    mouse_up(e:MouseEvent) {
        const x = e.offsetX,
            y = e.offsetY;
        wormsInstance.canvases.terrain.globalCompositeOperation = "destination-out";
        wormsInstance.canvases.terrain.beginPath();
        wormsInstance.canvases.terrain.arc(x, y, 30, 0, Math.PI * 2, true);
        wormsInstance.canvases.terrain.fill();
        
        //update
        const newCanvasData = wormsInstance.canvases.terrain.getImageData(wormsInstance.terrain_bmp.x, wormsInstance.terrain_bmp.y, wormsInstance.terrain_bmp.width, wormsInstance.terrain_bmp.height);
        wormsInstance.terrain_bmp.imageData = newCanvasData;
        wormsInstance.canvases.terrain.putImageData(newCanvasData, wormsInstance.terrain_bmp.x, wormsInstance.terrain_bmp.y);
        wormsInstance.draw_objects();
    }
    key_down(e:KeyboardEvent) {
        const KeyID = e.key;
        if (KeyID === "ArrowLeft") wormsInstance.left_key = true;
        if (KeyID === "ArrowRight") wormsInstance.right_key = true;
        if (KeyID === "ArrowUp" || KeyID === " ") wormsInstance.space_key = true;
    }
    key_up = function (e:KeyboardEvent) {
        const KeyID = e.key;
        if (KeyID === "ArrowLeft") wormsInstance.left_key = false;
        if (KeyID === "ArrowRight") wormsInstance.right_key = false;
        if (KeyID === "ArrowUp" || KeyID === " ") wormsInstance.space_key = false;
    }
}
let wormsInstance:WORMS =null;
class Main {
	static init (){	
		const canvas = document.getElementById("canvas") as HTMLCanvasElement;
		wormsInstance = new WORMS(canvas);
        wormsInstance.init();
	}
}
export {Main};