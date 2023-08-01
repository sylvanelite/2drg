
import { idxToXy,CONTROLS,PRNG,EuqippedKind } from "../types.mjs";
import { Entity } from "../Entity.mjs";
import { Room } from "../Room.mjs";
import { Terrain } from "../Terrain.mjs";
class Enemy{
    
    static update(room:Room,entity:Entity){
        if(entity.hp<1){
            Room.RemoveEntity(room,entity);
        }
        if(entity.cooldown==0){
            //TODO: cooldown==0, do attack
            entity.cooldown+=30;//TODO: add a random amount
        }
        //update AI
        let tgtX = entity.position.x;
        let tgtY = entity.position.y;
        for(const pid of room.players){
            tgtX = room.entities[pid].position.x+Math.floor(room.entities[pid].size.x/2);
            tgtY = room.entities[pid].position.y;
        }
        //movement, if overlapping terrain, move slower
        let moveSpeed = 1;
        if (Terrain.hitTest(room.terrain, entity.position.x, entity.position.y, entity.size.x, entity.size.y)) {
            moveSpeed = 0.2;
        }
        if(entity.euqipped == EuqippedKind.ENEMY_GRUNT){
            //linear move towards
            if(tgtX<entity.position.x){
                entity.position.x-=moveSpeed;
            }
            if(tgtX>entity.position.x){
                entity.position.x+=moveSpeed;
            }
            if(tgtY<entity.position.y){
                entity.position.y-=moveSpeed;
            }
            if(tgtY>entity.position.y){
                entity.position.y+=moveSpeed;
            }
        }
        if(entity.euqipped == EuqippedKind.ENEMY_WINGED){
            //linear move towards, but stay at current Y
            
            if(tgtX<entity.position.x){
                entity.position.x-=moveSpeed;
            }
            if(tgtX>entity.position.x){
                entity.position.x+=moveSpeed;
            }
            if(tgtY<entity.position.y){
                entity.position.y-=moveSpeed;
            }
            if(tgtY>entity.position.y){
                entity.position.y+=moveSpeed;
            }
        }
    }
    
    static draw(ctx:CanvasRenderingContext2D,entity:Entity){
        ctx.fillStyle = "#0000FF";
        if(entity.euqipped == EuqippedKind.ENEMY_WINGED){
            ctx.fillStyle = "#54D7FF";
        }
        ctx.fillRect(entity.position.x,entity.position.y,entity.size.x,entity.size.y);
    }
}
export {Enemy}