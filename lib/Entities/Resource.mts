
import { EntityKind,EuqippedKind } from "../types.mjs";
import { Entity,Collision } from "../Entity.mjs";
import { Room } from "../Room.mjs";
import { ImageCache } from "../ImageCache.mjs";
import { sprites } from "../sprites.mjs";
class Resource{
    
    static update(room:Room,entity:Entity){
        //NOTE: this is currently not called, if adding code here, make sure to update Entity.mts   
    }
    
    static draw(ctx:CanvasRenderingContext2D,entity:Entity){
        const image = ImageCache.getImage("./media/sprites.png");
        if (!image.loaded){return;}
        let spr = sprites.gold_bottom;
        if(entity.sprite == EuqippedKind.RESOURCE_BISMORE_BOTTOM){
            spr = sprites.bismore_bottom;
        }
        if(entity.sprite == EuqippedKind.RESOURCE_BISMORE_TOP){
            spr = sprites.bismore_top;
        }
        if(entity.sprite == EuqippedKind.RESOURCE_CROPPA_TOP){
            spr = sprites.croppa_top;
        }
        if(entity.sprite == EuqippedKind.RESOURCE_CROPPA_BOTTOM){
            spr = sprites.croppa_bottom;
        }
        if(entity.sprite == EuqippedKind.RESOURCE_NITRA_BOTTOM){
            spr = sprites.nitra_bottom;
        }
        if(entity.sprite == EuqippedKind.RESOURCE_NITRA_TOP){
            spr = sprites.nitra_top;
        }
        if(entity.sprite == EuqippedKind.RESOURCE_RED_SUGAR_BOTTOM){
            spr = sprites.red_sugar_bottom;
        }
        if(entity.sprite == EuqippedKind.RESOURCE_RED_SUGAR_TOP){
            spr = sprites.red_sugar_top;
        }
        if(entity.sprite == EuqippedKind.RESOURCE_GOLD_TOP){
            spr = sprites.nitra_top;
        }
        if(entity.sprite == EuqippedKind.RESOURCE_GOLD_BOTTOM){
            spr = sprites.nitra_bottom;
        }
        ImageCache.drawTile(ctx,image,entity.position.x,entity.position.y,
            spr.x,spr.y,spr.w,spr.h,false,false);
    }
}
export {Resource}