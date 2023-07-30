import { xyToIdx,Bit } from "./types.mjs";
import { ImageCache } from "./ImageCache.mjs";

const TERRAIN_WIDTH = 256;
const TERRAIN_HEIGHT = 128;

class Terrain {
    terrain:Uint8Array;
    width:number;
    height:number;
    #isRendered:boolean;
    #imageData:HTMLCanvasElement;
    constructor(){
        this.width = TERRAIN_WIDTH;
        this.height = TERRAIN_HEIGHT;
        this.terrain = new Uint8Array(Math.floor(this.width*this.height )/ 8);
        this.#isRendered = false;
    }
    static getBit(x:number,y:number,terrain:Terrain){
        const idx = xyToIdx(x,y,terrain.width);
		const bitIdx = Math.floor(idx/8);
        const remainder = idx%(8);
        return Bit.BIT_CHECK(terrain.terrain[bitIdx],remainder);
    }
    static setBit(value:boolean,x:number,y:number,terrain:Terrain){
        const idx = xyToIdx(x,y,terrain.width);
		const bitIdx = Math.floor(idx/8);
        const remainder = idx%(8);
        if(value){//set
            terrain.terrain[bitIdx] = Bit.BIT_SET(terrain.terrain[bitIdx],remainder);
        }else{//clear
            terrain.terrain[bitIdx] = Bit.BIT_CLEAR(terrain.terrain[bitIdx],remainder);
        }
    }
    static hitTest(terrain:Terrain,x:number,y:number,w:number,h:number) {
        x=Math.floor(x);
        y=Math.floor(y);
        w=Math.floor(w);
        h=Math.floor(h);
		for (let x_ = 0; x_ < w; x_+=1) {
			for (let y_ = 0; y_ < h; y_+=1) {
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
                            Terrain.setBit(false,i,j,terrain);
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
                        Terrain.setBit(true,i,j,terrain);
                    }
            }
        }
    }
    static draw(ctx:CanvasRenderingContext2D,terrain:Terrain){
        if(terrain.#imageData){//always draw the previous image to prevent flicker on re-draw
            ctx.drawImage(terrain.#imageData,0,0);
        }
        //the image is fully cached, don't regenerate pixel data
        if(terrain.#isRendered){
            return;
        }
        //otherwise, regenerate in an offscreen canvas
        const offscreenCanvas = new OffscreenCanvas(TERRAIN_WIDTH,TERRAIN_HEIGHT);
        const offscreenContext = offscreenCanvas.getContext('2d');
        const imageData =  offscreenContext.createImageData(TERRAIN_WIDTH, TERRAIN_HEIGHT);
        for (let x = 0; x < imageData.width; x+=1) {
            for (let y = 0; y < imageData.height; y+=1) {
                // Index of the pixel in the array
                const isFilled = Terrain.getBit(x,y,terrain);
                const idx = (x + y * terrain.width) * 4;
                imageData.data[idx + 0] = 0;
                imageData.data[idx + 1] = isFilled?255:0;
                imageData.data[idx + 2] = 0;
                imageData.data[idx + 3] = isFilled?255:0;//TODO can always be 255 if background
            }
        }
        offscreenContext.putImageData(imageData,0,0);
        const image = ImageCache.getImage("./media/terrain_1.png");
        if (!image.loaded){return;}//don't set isRendered=true until image has loaded
        offscreenContext.globalCompositeOperation = "source-in";
        offscreenContext.drawImage(image.data,0,0);
        terrain.#imageData = offscreenCanvas as any as HTMLCanvasElement;//casting needed to convert offscreen to htmlElement
         //imageData;
        terrain.#isRendered = true;
    }
}

export {Terrain,TERRAIN_WIDTH,TERRAIN_HEIGHT};