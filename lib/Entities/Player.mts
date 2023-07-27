

import { NetplayInput, NetplayState } from "../netPeer/netplayInput.mjs";
import { xyToIdx,CONTROLS,EntityKind,PRNG,EuqippedKind } from "../types.mjs";
import { Entity } from "../Entity.mjs";
import { Room } from "../Room.mjs";
import { Terrain } from "../Terrain.mjs";
import { Game } from '../Game.mjs'
class Player{
    static update(room:Room,entity:Entity) {
        const controls =Game.inputs.get(entity.uid);
        let i = 0;
        for (i = 0; i < 3; i+=1) {    
            if ( NetplayInput.getPressed(controls,CONTROLS.LEFT)) {
                if (!Terrain.hitTest(room.terrain, entity.position.x , entity.position.y, 1, 1)) {
                    entity.position.x -= 1;
                }
                while (Terrain.hitTest(room.terrain, entity.position.x, entity.position.y + 20, 10, 1)) {
                    entity.position.y -= 1;
                }
            }
            if (NetplayInput.getPressed(controls,CONTROLS.RIGHT)) {
                if (!Terrain.hitTest(room.terrain, entity.position.x + 10, entity.position.y, 1, 1)) {
                    entity.position.x += 1;
                }
                while (Terrain.hitTest(room.terrain, entity.position.x, entity.position.y + 20, 10, 1)) {
                    entity.position.y -= 1;
                }
            }
        }
        if (NetplayInput.getPressed(controls,CONTROLS.JUMP)) {
            entity.velocity.y = -3;
            //Game.gameInstance.jumping = true;//TODO: fix jumping
        }
        entity.velocity.y+=1; //is this going to work prooperly?
        if (entity.velocity.y > 0) {
            //check ground
            for (i = 0; i < entity.velocity.y; i+=1) {
                if (!Terrain.hitTest(room.terrain, entity.position.x, entity.position.y + 20, 10, 1)) {
                    entity.position.y += 1;
                } else {
                    //Game.gameInstance.jumping = false;//TODO: fix jumping
                    entity.velocity.y = 0;
                }
            }
        } else {
            for (i = 0; i < Math.abs(entity.velocity.y); i+=1) {
                if (!Terrain.hitTest(room.terrain, entity.position.x, entity.position.y, 10, 1)) {
                    entity.position.y -= 1;
                } else {
                    entity.velocity.y = 0;
                }
            }
        }
        //move between rooms, going off one side means going onto another
        const buffer = 3;
        if(entity.position.x<0 && room.x>0){
            const idx = xyToIdx(room.x-1,room.y,Game.gameInstance.worldWidth);
            const targetRoom = Game.gameInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.x=room.terrain.width-entity.size.x-buffer;
            if(entity.uid==Game.gameInstance.playerUid){ Game.gameInstance.currentRoom = idx; }
        }
        if(entity.position.x+entity.size.x > room.terrain.width&& room.x<Game.gameInstance.worldWidth-1){
            const idx = xyToIdx(room.x+1,room.y,Game.gameInstance.worldWidth);
            const targetRoom = Game.gameInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.x=buffer;
            if(entity.uid==Game.gameInstance.playerUid){ Game.gameInstance.currentRoom = idx; }
        }
        if(entity.position.y<0 && room.y>0){
            const idx = xyToIdx(room.x,room.y-1,Game.gameInstance.worldWidth);
            const targetRoom = Game.gameInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.y=room.terrain.height-entity.size.y-buffer;
            if(entity.uid==Game.gameInstance.playerUid){ Game.gameInstance.currentRoom = idx; }
        }
        if(entity.position.y+entity.size.y > room.terrain.height&& room.y<Game.gameInstance.worldWidth-1){
            const idx = xyToIdx(room.x,room.y+1,Game.gameInstance.worldWidth);
            const targetRoom = Game.gameInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.y =buffer;
            if(entity.uid==Game.gameInstance.playerUid){ Game.gameInstance.currentRoom = idx; }
        }
        //==shooting (TODO: spawn bullet & bresenham)
        if(entity.cooldown>0){//canshoot
            entity.cooldown-=1;
        }
        if (controls.mousePosition&& NetplayInput.getPressed(controls,CONTROLS.SHOOT) ) {
            if(entity.cooldown==0){//canshoot
                const mousePos =controls.mousePosition;
                const bulletEntity = new Entity();//TODO: real init...
                bulletEntity.kind = EntityKind.Bullet;
                bulletEntity.euqipped = entity.euqipped;//bullet type match the weapon that shot it
                bulletEntity.size.x = 2;
                bulletEntity.size.y = 2;
                bulletEntity.position.x = entity.position.x;
                bulletEntity.position.y = entity.position.y;
                const aimingAngleRads = Math.atan2(mousePos.y-entity.position.y,mousePos.x-entity.position.x) ;//* 180 / Math.PI to get deg
                switch(entity.euqipped){
                    case EuqippedKind.WEAPON_FLAMETHROWER:
                        entity.cooldown = 1;//cooldown 
                        bulletEntity.hp = 1;//damage
                        bulletEntity.cooldown = 20;//bullet lifetime
                        //TODO: spread...
                        bulletEntity.velocity.x = Math.cos(aimingAngleRads)*5;//speed
                        bulletEntity.velocity.y = Math.sin(aimingAngleRads)*5;//speed
                        Room.AddEntity(room,bulletEntity);
                        break;
                    case EuqippedKind.WEAPON_MACHINEGUN:
                        entity.cooldown = 5;//cooldown 
                        bulletEntity.hp = 5;//damage
                        bulletEntity.cooldown = 100;//bullet lifetime
                        bulletEntity.velocity.x = Math.cos(aimingAngleRads)*10;//speed
                        bulletEntity.velocity.y = Math.sin(aimingAngleRads)*10;//speed
                        Room.AddEntity(room,bulletEntity);
                        break;
                    case EuqippedKind.WEAPON_PIERCE:
                        entity.cooldown = 50;//cooldown 
                        bulletEntity.hp = 50;//damage
                        bulletEntity.cooldown = 100;//bullet lifetime
                        bulletEntity.velocity.x = Math.cos(aimingAngleRads)*10;//speed
                        bulletEntity.velocity.y = Math.sin(aimingAngleRads)*10;//speed
                        Room.AddEntity(room,bulletEntity);
                        break;
                }
            }
        }

    }
    static draw(ctx:CanvasRenderingContext2D,entity:Entity){
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(entity.position.x,entity.position.y,entity.size.x,entity.size.y);
    }
}
export {Player}