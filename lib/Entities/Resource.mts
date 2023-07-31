
import { EntityKind,EuqippedKind } from "../types.mjs";
import { Entity,Collision } from "../Entity.mjs";
import { Room } from "../Room.mjs";
import { ImageCache } from "../ImageCache.mjs";
import { sprites } from "../sprites.mjs";
import { Conductor } from "./Conductor.mjs";
class Resource{
    
    static update(room:Room,entity:Entity){
        if(entity.hp<1){//hp 0 means the resource has been collected
            Resource.collectResource(room,entity);
        }
    }
    
    static collectResource(room:Room,entity:Entity){
        if(entity.euqipped == EuqippedKind.RESOURCE_EGG){
            Conductor.TiggerWave(room,EuqippedKind.WAVE_LOCKED_ROOM);
        }
        Room.RemoveEntity(room,entity);
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
        if(entity.sprite == EuqippedKind.RESOURCE_AQUARQ){
            spr = sprites.aquarq;
        }
        if(entity.sprite == EuqippedKind.RESOURCE_EGG){
            spr = sprites.egg;
        }
        if(entity.sprite == EuqippedKind.RESOURCE_FOSSIL){
            spr = sprites.fossil;
        }
        ImageCache.drawTile(ctx,image,entity.position.x,entity.position.y,
            spr.x,spr.y,spr.w,spr.h,false,false);
    }
}
export {Resource}