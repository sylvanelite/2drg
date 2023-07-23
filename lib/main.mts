//TODO:
/*
store terrain in backing typed array (bitmask) & flag if it's been changed
on change, regenerate canvas mask for image to render

query hit test by checking bitmask, not rendered pixel data (esp for rollback, screen may not be refreshed)

split into rooms & grid, each update loop, update each room

*/

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
}


//bit manipulation helper functions 
class Bit {
	static BIT_CHECK(a:number,b:number):boolean{return  (!!((a) & (0x01<<(b))));}
	static BIT_SET(a:number,b:number):number{ ((a) |= (0x01<<(b)));return a;}
	static BIT_CLEAR(a:number,b:number):number{ ((a) &= ~(0x01<<(b)));return a;}
}
class Terrain {
    roomid:number;
    terrain:Uint8Array;
    width:number;
    height:number;
    #isRendered:boolean;
    #imageData:ImageData;
    constructor(id:number){
        this.roomid = id;
        this.width = 300;
        this.height = 150;
        this.terrain = new Uint8Array(Math.floor(this.width*this.height )/ 8);
        this.#isRendered = false;
    }
    static #xyToIdx(x:number,y:number,width:number){ return x*width+y; }
    static getBit(x:number,y:number,terrain:Terrain){
        const idx = Terrain.#xyToIdx(x,y,terrain.width);
		const bitIdx = Math.floor(idx/8);
        const remainder = idx%(8);
        return Bit.BIT_CHECK(terrain.terrain[bitIdx],remainder);
    }
    static #setBit(value:boolean,x:number,y:number,terrain:Terrain){
        const idx = Terrain.#xyToIdx(x,y,terrain.width);
		const bitIdx = Math.floor(idx/8);
        const remainder = idx%(8);
        if(value){//set
            terrain.terrain[bitIdx] = Bit.BIT_SET(terrain.terrain[bitIdx],remainder);
        }else{//clear
            terrain.terrain[bitIdx] = Bit.BIT_CLEAR(terrain.terrain[bitIdx],remainder);
        }
    }
    static hitTest(terrain:Terrain,x:number,y:number,w:number,h:number) {
		for (let x_ = 0; x_ < w; x_++) {
			for (let y_ = 0; y_ < h; y_++) {
                const pixel = Terrain.getBit(x + x_, y+ y_, terrain);
                if (pixel ) return true;
			}
		}
        return false;
    }
    static clearCircle(terrain:Terrain,x:number,y:number,diameter:number){
        terrain.#isRendered = false;
        //TODO: use bitmasks instead?
        const radius = Math.floor(diameter/2);
        const radiusSquared = radius*radius;
        for(let i=x-radius;i<x+radius;i+=1){
            for(let j=y-radius;j<y+radius;j+=1){
                if(i>0&&i<terrain.width-1&& j>0&&j<terrain.height-1){
                        const distSquared = (x-i)*(x-i) + (y-j)*(y-j);
                        if(distSquared<radiusSquared){//clear pixels in 30px radius
                            Terrain.#setBit(false,i,j,terrain);
                        }
                    }
            }
        }
    }
    static fillRect(terrain:Terrain,x:number,y:number,w:number,h:number){
        terrain.#isRendered = false;
        for(let i=x;i<x+w;i+=1){
            for(let j=y;j<y+h;j+=1){
                if(i>0&&i<terrain.width-1&& j>0&&j<terrain.height-1){
                        Terrain.#setBit(true,i,j,terrain);
                    }
            }
        }
    }
    static draw(ctx:CanvasRenderingContext2D,terrain:Terrain){
        //if there's a cached copy of the image to render, use that
        if(terrain.#isRendered){
            ctx.putImageData(terrain.#imageData,0,0);
            return;
        }
        //otherwise, regenerate
        const imageData =  ctx.createImageData(300, 150);
        for (let x = 0; x < imageData.width; x++) {
            for (let y = 0; y < imageData.height; y++) {
                // Index of the pixel in the array
                const isFilled = Terrain.getBit(x,y,terrain);
                const idx = (x + y * terrain.width) * 4;
                imageData.data[idx + 0] = 0;
                imageData.data[idx + 1] = isFilled?255:0;
                imageData.data[idx + 2] = 0;
                imageData.data[idx + 3] = isFilled?255:0;//TODO can always be 255 if background
            }
        }
        ctx.putImageData(imageData,0,0);
        terrain.#imageData = imageData;
        terrain.#isRendered = true;
    }
}

class WORMS{
    ctx:CanvasRenderingContext2D;
    width:number;
    height:number;
    character_bmp:Bitmap;
    jumping:Boolean;
    left_key:Boolean;right_key:Boolean;space_key:Boolean;
    keys:Array<string>;
    character_speed:number;
    terrain:Terrain;
    constructor(canvas:HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;
        this.terrain = new Terrain(1);
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
        Terrain.fillRect(this.terrain,0,50,300,100);
        this.character_bmp.x = 100;
        this.character_bmp.y = 20;
        const buffer = document.createElement('canvas');
        buffer.height = this.height;
        buffer.width = this.width;
    }
    updateLoop() {
        this.move_character();
        setTimeout(function () {
            wormsInstance.updateLoop();
        }, 1000 / 30); //the loop
    }
    renderLoop() {
        wormsInstance.ctx.clearRect(0, 0, wormsInstance.width, wormsInstance.height);
        Terrain.draw(wormsInstance.ctx,wormsInstance.terrain);
        wormsInstance.ctx.putImageData(wormsInstance.character_bmp.imageData, wormsInstance.character_bmp.x, wormsInstance.character_bmp.y);
        window.requestAnimationFrame(wormsInstance.renderLoop);
    }
    move_character() {
        let i = 0;
        for (i = 0; i < 3; i++) {    
            if (this.left_key) {
                if (!Terrain.hitTest(this.terrain, this.character_bmp.x , this.character_bmp.y, 1, 1)) {
                    this.character_bmp.x -= 1;
                }
                while (Terrain.hitTest(this.terrain, this.character_bmp.x, this.character_bmp.y + 20, 10, 1)) {
                    this.character_bmp.y -= 1;
                }
            }
            if (this.right_key) {
                if (!Terrain.hitTest(this.terrain, this.character_bmp.x + 10, this.character_bmp.y, 1, 1)) {
                    this.character_bmp.x += 1;
                }
                while (Terrain.hitTest(this.terrain, this.character_bmp.x, this.character_bmp.y + 20, 10, 1)) {
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
                if (!Terrain.hitTest(this.terrain, this.character_bmp.x, this.character_bmp.y + 20, 10, 1)) {
                    this.character_bmp.y += 1;
                } else {
                    this.jumping = false;
                    this.character_speed = 0;
                }
            }
        } else {
            for (i = 0; i < Math.abs(this.character_speed); i++) {
                if (!Terrain.hitTest(this.terrain, this.character_bmp.x, this.character_bmp.y, 10, 1)) {
                    this.character_bmp.y -= 1;
                } else {
                    this.character_speed = 0;
                }
            }
        }
    }
    mouse_up(e:MouseEvent) {
        const x = e.offsetX, y = e.offsetY;
        Terrain.clearCircle(wormsInstance.terrain,x,y,30);
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