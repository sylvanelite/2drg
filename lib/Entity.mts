

import {xyToIdx,PRNG,CONTROLS,EntityKind,EuqippedKind} from './types.mjs';
import { NetplayInput,  } from "./netPeer/netplayInput.mjs";
import { Room } from './Room.mjs';
import { Terrain } from './Terrain.mjs';
import { Player } from './Player.mjs';
import { Bullet } from './Bullet.mjs';
import { Enemy } from './Enemy.mjs';
class Entity{
    static uid=0;
    uid:number;//globally unique id, preserved across room boundaries
    roomId:number;//index location in the room array, changes with room operations: insert/delete/move
    kind:EntityKind;//how the entity is controlled
    euqipped:EuqippedKind;//subtype, e.g. player class, bullet type, enemy type
    hp:number;
    maxHp:number;
    cooldown:number;//TODO: other vars, ammo, etc
    sprite:number;
    spriteFrame:number;
    position:{x:number,y:number};
    velocity:{x:number,y:number};
    size:{x:number,y:number};
    constructor(){
        this.uid = Entity.uid;
        Entity.uid+=1;
        this.roomId=0;
        this.kind = EntityKind.Enemy;
        this.hp=0;
        this.maxHp=100;
        this.cooldown=0;
        this.sprite=0;
        this.spriteFrame=0;
        this.position={x:0,y:0};
        this.velocity={x:0,y:0};
        this.size={x:10,y:20};
    }
    static update(room:Room,entity:Entity){
        //TODO:options for all ent.kind
        if(entity.kind == EntityKind.Player){
            Player.updatePlayer(room,entity);
        }
        if(entity.kind == EntityKind.Bullet){
            Bullet.updateBullet(room,entity);
        }
        if(entity.kind == EntityKind.Enemy){
            Enemy.updateEnemy(room,entity);
        }
    }
    static draw(ctx:CanvasRenderingContext2D,entity:Entity){
        //TODO: move into other files
        if(entity.kind == EntityKind.Player){
            ctx.fillStyle = "#FF0000";
        }
        if(entity.kind == EntityKind.Bullet){
            ctx.fillStyle = "#000000";
            if(entity.euqipped==EuqippedKind.WEAPON_FLAMETHROWER){
                ctx.fillStyle = "#FFA366";
            }
        }
        if(entity.kind == EntityKind.Enemy){
            ctx.fillStyle = "#0000FF";
            if(entity.euqipped == EuqippedKind.ENEMY_WINGED){
                ctx.fillStyle = "#54D7FF";
            }
        }
        if(entity.kind == EntityKind.Resource){
            ctx.fillStyle = "#FF00FF";
        }
        ctx.fillRect(entity.position.x,entity.position.y,entity.size.x,entity.size.y);
    }
}

export {Entity};