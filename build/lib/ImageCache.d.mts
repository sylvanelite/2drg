declare class ImageBmp {
    data: ImageBitmap;
    loaded: boolean;
    failed: boolean;
    path: string;
    constructor(path: string);
    static loadImage(imageCache: ImageBmp): Promise<void>;
}
declare class ImageCache {
    static imageCache: Map<string, ImageBmp>;
    static getImage(path: string): ImageBmp;
    static drawTile(context: CanvasRenderingContext2D, image: ImageBmp, targetX: number, targetY: number, tileX: number, tileY: number, tileWidth: number, tileHeight: number, flipX: boolean, flipY: boolean): void;
}
export { ImageCache };
