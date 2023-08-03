
import { idxToXy,CONTROLS,PRNG,EuqippedKind, EntityKind } from "../types.mjs";
import { Collision, Entity } from "../Entity.mjs";
import { Room } from "../Room.mjs";
import { Terrain } from "../Terrain.mjs";
class Enemy{
    
    static update(room:Room,entity:Entity){
        if(entity.hp<1){
            Room.RemoveEntity(room,entity);
        }
        entity.cooldown-=1;
        if(entity.cooldown<=0){//attack speed
            //add random amount so enemeies that are stacked have variance
            entity.cooldown+=6+Math.floor(PRNG.prng()*3);
            let attack = 5;
            if(entity.euqipped = EuqippedKind.ENEMY_GRUNT){
                attack=5;
            }
            if(entity.euqipped = EuqippedKind.ENEMY_WINGED){
                attack=2;
            }
            //deal damage to players
            Collision.checkCollisions(room,entity,(collisionId:number)=>{
                const ent = room.entities[collisionId];
                if(ent.kind == EntityKind.Player){
                    ent.hp-=attack;
                }
            });
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
        if(entity.cooldown<=1){//attack
            ctx.fillStyle = "#FF00FF";
            ctx.fillRect(entity.position.x,entity.position.y,entity.size.x,entity.size.y);
        }
    }
}
export {Enemy}