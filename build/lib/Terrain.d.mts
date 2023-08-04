declare const TERRAIN_WIDTH = 256;
declare const TERRAIN_HEIGHT = 128;
declare class Terrain {
    #private;
    terrain: Uint8Array;
    width: number;
    height: number;
    constructor();
    static getBit(x: number, y: number, terrain: Terrain): boolean;
    static setBit(value: boolean, x: number, y: number, terrain: Terrain): void;
    static hitTest(terrain: Terrain, x: number, y: number, w: number, h: number): boolean;
    static clearCircle(terrain: Terrain, x: number, y: number, diameter: number): void;
    static fillRect(terrain: Terrain, x: number, y: number, w: number, h: number): void;
    static draw(ctx: CanvasRenderingContext2D, terrain: Terrain): void;
}
export { Terrain, TERRAIN_WIDTH, TERRAIN_HEIGHT };
