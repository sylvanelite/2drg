import { xyToIdx,Bit } from "./types.mjs";

class Terrain {
    terrain:Uint8Array;
    width:number;
    height:number;
    #isRendered:boolean;
    #imageData:ImageData;
    constructor(){
        this.width = 300;
        this.height = 150;
        this.terrain = new Uint8Array(Math.floor(this.width*this.height )/ 8);
        this.#isRendered = false;
    }
    static getBit(x:number,y:number,terrain:Terrain){
        const idx = xyToIdx(x,y,terrain.width);
		const bitIdx = Math.floor(idx/8);
        const remainder = idx%(8);
        return Bit.BIT_CHECK(terrain.terrain[bitIdx],remainder);
    }
    static #setBit(value:boolean,x:number,y:number,terrain:Terrain){
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
        ctx.putImageData(imageData,0,0);
        terrain.#imageData = imageData;
        terrain.#isRendered = true;
    }
}

export {Terrain};