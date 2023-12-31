
import { NetplayInput, NetplayState } from "../netPeer/netplayInput.mjs";
import { idxToXy,CONTROLS,EntityKind,PRNG,EuqippedKind } from "../types.mjs";
import { Entity,Collision } from "../Entity.mjs";
import { Room } from "../Room.mjs";
import { Terrain } from "../Terrain.mjs";

class Bullet{
    static update(room:Room,entity:Entity) {
        //bresenham
        //https://stackoverflow.com/questions/4672279/bresenham-algorithm-in-javascript
        let x1 = entity.position.x;
        let y1 = entity.position.y;
        const x2 = x1+Math.ceil(entity.velocity.x);
        const y2 = y1+Math.ceil(entity.velocity.y);
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = (x1 < x2) ? 1 : -1;
        const sy = (y1 < y2) ? 1 : -1;
        let err = dx - dy;
        // Main loop
        while (!((x1 == x2) && (y1 == y2))) {
            var e2 = err << 1;
            if (e2 > -dy) {
                err -= dy;
                x1 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y1 += sy;
            }
            //update coordinates
            entity.position.x = x1;
            entity.position.y = y1;
            if (Terrain.hitTest(room.terrain, entity.position.x, entity.position.y, entity.size.x, entity.size.y)) {
                Bullet.destroyBullet(room,entity);
                break;
            }
        }
        //destroy on collide with other
        Collision.checkCollisions(room,entity,(collisionId:number)=>{
            const ent = room.entities[collisionId];
            if(ent.kind == EntityKind.Resource &&
                entity.euqipped == EuqippedKind.WEAPON_MINE){
                ent.hp=0;//0 hp will trigger resource gathering
                Room.RemoveEntity(room,entity);
            }
            if(ent.kind == EntityKind.Enemy){
                //bullet collide
                ent.hp-=entity.hp;
                if(entity.euqipped == EuqippedKind.WEAPON_MACHINEGUN){
                    Room.RemoveEntity(room,entity);
                }
                if(entity.euqipped == EuqippedKind.WEAPON_SNIPER){
                    Room.RemoveEntity(room,entity);
                }
                //flamethrower&shotgun pierces, so don't destroy on collision
            }
        });
        if(entity.position.x<0||entity.position.x>room.terrain.width||
            entity.position.y<0||entity.position.y>room.terrain.height){
            Room.RemoveEntity(room,entity);//if going out of bounds, remove without destroy (explode)
        }
        entity.cooldown-=1;
        if(entity.cooldown<0){
            Room.RemoveEntity(room,entity);//bullet timed out
        }
        if(entity.euqipped == EuqippedKind.WEAPON_MINE){
            Terrain.clearCircle(room.terrain,entity.position.x,entity.position.y,16);
        }
    }
    static destroyBullet(room:Room,entity:Entity){
        Room.RemoveEntity(room,entity);
    }
    static draw(ctx:CanvasRenderingContext2D,entity:Entity){
        ctx.fillStyle = "#000000";
        if(entity.euqipped==EuqippedKind.WEAPON_FLAMETHROWER){
            ctx.fillStyle = "#FFA366";
        }
        if(entity.euqipped==EuqippedKind.WEAPON_MACHINEGUN){
            ctx.fillStyle = "#CCCCCC";
        }
        if(entity.euqipped==EuqippedKind.WEAPON_SHOTGUN){
            ctx.fillStyle = "#FF0000";
        }
        if(entity.euqipped==EuqippedKind.WEAPON_SNIPER){
            ctx.fillStyle = "#FFFFFF";
        }
        ctx.fillRect(entity.position.x,entity.position.y,entity.size.x,entity.size.y);
    }
}
export {Bullet}