class ImageBmp {
    data = null;
    loaded = false;
    failed = false;
    path = "";
    constructor(path) {
        this.path = path;
        if (!path) {
            return;
        }
        ImageBmp.loadImage(this);
    }
    static async loadImage(imageCache) {
        ImageCache.imageCache.set(imageCache.path, imageCache);
        if (!imageCache.path) {
            imageCache.failed = true;
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
        }).catch(function () {
            imageCache.failed = true;
        });
    }
}
class ImageCache {
    static imageCache = new Map();
    static getImage(path) {
        const cachedImage = ImageCache.imageCache.get(path);
        if (!cachedImage) {
            return new ImageBmp(path);
        }
        return cachedImage;
    }
    static drawTile(context, image, targetX, targetY, tileX, tileY, tileWidth, tileHeight, flipX, flipY) {
        tileHeight = tileHeight ? tileHeight : tileWidth;
        if (!image.loaded || tileWidth > image.data.width || tileHeight > image.data.height) {
            return;
        }
        const scale = 1;
        const tileWidthScaled = Math.floor(tileWidth * scale);
        const tileHeightScaled = Math.floor(tileHeight * scale);
        const scaleX = flipX ? -1 : 1;
        const scaleY = flipY ? -1 : 1;
        if (flipX || flipY) {
            context.save();
            context.scale(scaleX, scaleY);
        }
        context.drawImage(image.data, tileX * scale, tileY * scale, tileWidthScaled, tileHeightScaled, Math.round(targetX) * scaleX - (flipX ? tileWidthScaled : 0), Math.round(targetY) * scaleY - (flipY ? tileHeightScaled : 0), tileWidthScaled, tileHeightScaled);
        if (flipX || flipY) {
            context.restore();
        }
    }
}
export { ImageCache };
//# sourceMappingURL=ImageCache.mjs.map