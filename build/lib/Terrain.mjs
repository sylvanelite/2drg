import { xyToIdx, Bit } from "./types.mjs";
import { ImageCache } from "./ImageCache.mjs";
const TERRAIN_WIDTH = 256;
const TERRAIN_HEIGHT = 128;
class Terrain {
    terrain;
    width;
    height;
    #isRendered;
    #imageData;
    constructor() {
        this.width = TERRAIN_WIDTH;
        this.height = TERRAIN_HEIGHT;
        this.terrain = new Uint8Array(Math.floor(this.width * this.height) / 8);
        this.#isRendered = false;
    }
    static getBit(x, y, terrain) {
        const idx = xyToIdx(x, y, terrain.width);
        const bitIdx = Math.floor(idx / 8);
        const remainder = idx % (8);
        return Bit.BIT_CHECK(terrain.terrain[bitIdx], remainder);
    }
    static setBit(value, x, y, terrain) {
        const idx = xyToIdx(x, y, terrain.width);
        const bitIdx = Math.floor(idx / 8);
        const remainder = idx % (8);
        if (value) {
            terrain.terrain[bitIdx] = Bit.BIT_SET(terrain.terrain[bitIdx], remainder);
        }
        else {
            terrain.terrain[bitIdx] = Bit.BIT_CLEAR(terrain.terrain[bitIdx], remainder);
        }
    }
    static hitTest(terrain, x, y, w, h) {
        x = Math.floor(x);
        y = Math.floor(y);
        w = Math.floor(w);
        h = Math.floor(h);
        for (let x_ = 0; x_ < w; x_ += 1) {
            for (let y_ = 0; y_ < h; y_ += 1) {
                const pixel = Terrain.getBit(x + x_, y + y_, terrain);
                if (pixel)
                    return true;
            }
        }
        return false;
    }
    static clearCircle(terrain, x, y, diameter) {
        terrain.#isRendered = false;
        const radius = Math.floor(diameter / 2);
        const radiusSquared = radius * radius;
        for (let i = x - radius; i < x + radius; i += 1) {
            for (let j = y - radius; j < y + radius; j += 1) {
                if (i > 0 && i < terrain.width - 1 && j > 0 && j < terrain.height - 1) {
                    const distSquared = (x - i) * (x - i) + (y - j) * (y - j);
                    if (distSquared < radiusSquared) {
                        Terrain.setBit(false, i, j, terrain);
                    }
                }
            }
        }
    }
    static fillRect(terrain, x, y, w, h) {
        terrain.#isRendered = false;
        for (let i = x; i < x + w; i += 1) {
            for (let j = y; j < y + h; j += 1) {
                if (i > 0 && i < terrain.width - 1 && j > 0 && j < terrain.height - 1) {
                    Terrain.setBit(true, i, j, terrain);
                }
            }
        }
    }
    static draw(ctx, terrain) {
        if (terrain.#imageData) {
            ctx.drawImage(terrain.#imageData, 0, 0);
        }
        if (terrain.#isRendered) {
            return;
        }
        const offscreenCanvas = new OffscreenCanvas(TERRAIN_WIDTH, TERRAIN_HEIGHT);
        const offscreenContext = offscreenCanvas.getContext('2d');
        const imageData = offscreenContext.createImageData(TERRAIN_WIDTH, TERRAIN_HEIGHT);
        for (let x = 0; x < imageData.width; x += 1) {
            for (let y = 0; y < imageData.height; y += 1) {
                const isFilled = Terrain.getBit(x, y, terrain);
                const idx = (x + y * terrain.width) * 4;
                imageData.data[idx + 0] = 0;
                imageData.data[idx + 1] = isFilled ? 255 : 0;
                imageData.data[idx + 2] = 0;
                imageData.data[idx + 3] = isFilled ? 255 : 0;
            }
        }
        offscreenContext.putImageData(imageData, 0, 0);
        const image = ImageCache.getImage("./media/terrain_1.png");
        if (!image.loaded) {
            return;
        }
        offscreenContext.globalCompositeOperation = "source-in";
        offscreenContext.drawImage(image.data, 0, 0);
        terrain.#imageData = offscreenCanvas;
        terrain.#isRendered = true;
    }
}
export { Terrain, TERRAIN_WIDTH, TERRAIN_HEIGHT };
//# sourceMappingURL=Terrain.mjs.map