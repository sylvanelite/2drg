
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
            //TODO: if solid.... (if need to check terrain...)
            entity.position.x = x1;
            entity.position.y = y1;
            if (Terrain.hitTest(room.terrain, entity.position.x, entity.position.y, entity.size.x, entity.size.y)) {
                Bullet.destroyBullet(room,entity);
                break;
            }
        }
        if(entity.position.x<0||entity.position.x>room.terrain.width||
            entity.position.y<0||entity.position.y>room.terrain.height){
            Room.RemoveEntity(room,entity);//if going out of bounds, remove without destroy (explode)
        }
        entity.cooldown-=1;
        if(entity.cooldown<0){
            Room.RemoveEntity(room,entity);//bullet timed out
        }
    }
    static destroyBullet(room:Room,entity:Entity){
        if(entity.euqipped == EuqippedKind.WEAPON_FLAMETHROWER){
            Terrain.clearCircle(room.terrain,entity.position.x,entity.position.y,10);
        }
        if(entity.euqipped == EuqippedKind.WEAPON_MACHINEGUN){
            Terrain.clearCircle(room.terrain,entity.position.x,entity.position.y,10);
        }
        if(entity.euqipped == EuqippedKind.WEAPON_PIERCE){
            Terrain.clearCircle(room.terrain,entity.position.x,entity.position.y,10);
        }
        Room.RemoveEntity(room,entity);
    }
    static draw(ctx:CanvasRenderingContext2D,entity:Entity){
        ctx.fillStyle = "#000000";
        if(entity.euqipped==EuqippedKind.WEAPON_FLAMETHROWER){
            ctx.fillStyle = "#FFA366";
        }
        ctx.fillRect(entity.position.x,entity.position.y,entity.size.x,entity.size.y);
    }
}
export {Bullet}