class ImageBmp {
    data:ImageBitmap = null;
    loaded = false;
    failed = false;
    path = "";

    constructor(path:string) {
        this.path = path;
        if(!path){return;}
        ImageBmp.loadImage(this);
    }

    static async loadImage(imageCache:ImageBmp) {
        ImageCache.imageCache.set(imageCache.path , imageCache);
        if(!imageCache.path){
            imageCache.failed = true;//invalid URL provided
        }
        const req = new Request(imageCache.path);
        fetch(req).then(async (response) => {
            if (!response.ok) {
                imageCache.failed = true;
                return;
            }
            const img = await createImageBitmap(await response.blob());
            imageCache.loaded = true;
            imageCache.data = img;
        }).catch(function() {
            imageCache.failed = true;
        });
    }

}

class ImageCache {
    static imageCache = new Map<string,ImageBmp>();
    static getImage(path:string):ImageBmp {
        const cachedImage = ImageCache.imageCache.get(path);
        if (!cachedImage) {
            return new ImageBmp(path);
        }
        return cachedImage;
    }
    static drawTile(context:CanvasRenderingContext2D,image:ImageBmp, targetX:number, targetY:number, tile:number, tileWidth:number, tileHeight:number, flipX:number, flipY:number) {
        tileHeight = tileHeight ? tileHeight : tileWidth;

        if (!image.loaded || tileWidth > image.data.width || tileHeight > image.data.height) {
            return;
        }

        const scale = 1; //TODO: scale?
        const tileWidthScaled = Math.floor(tileWidth * scale);
        const tileHeightScaled = Math.floor(tileHeight * scale);

        const scaleX = flipX ? -1 : 1;
        const scaleY = flipY ? -1 : 1;

        if (flipX || flipY) {
            context.save();
            context.scale(scaleX, scaleY);
        }
        context.drawImage(
            image.data,
            (Math.floor(tile * tileWidth) % image.data.width) * scale,
            (Math.floor(tile * tileWidth / image.data.width) * tileHeight) * scale,
            tileWidthScaled,
            tileHeightScaled,
            Math.round(targetX) * scaleX - (flipX ? tileWidthScaled : 0),
            Math.round(targetY) * scaleY - (flipY ? tileHeightScaled : 0),
            tileWidthScaled,
            tileHeightScaled
        );
        if (flipX || flipY) {
            context.restore();
        }
    }
}

export { ImageCache }