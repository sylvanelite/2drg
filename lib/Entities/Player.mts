

import { NetplayInput } from "../netPeer/netplayInput.mjs";
import { xyToIdx,CONTROLS,EntityKind,PRNG,EuqippedKind } from "../types.mjs";
import { Entity } from "../Entity.mjs";
import { Room } from "../Room.mjs";
import { Terrain } from "../Terrain.mjs";
import { Game } from '../Game.mjs'
import { ImageCache } from "../ImageCache.mjs";
import { sprites,IMAGE_HEIGHT,IMAGE_WIDTH } from "../sprites.mjs";
const PLAYER_SPRITE = {
    STANDING_LEFT:0,
    STANDING_RIGHT:1,
    MOVING_LEFT:2,
    MOVING_RIGHT:3,
    JUMPING_LEFT:4,
    JUMPING_RIGHT:5,
    FALLING_LEFT:6,
    FALLING_RIGHT:7
};
class Player{
    static update(room:Room,entity:Entity) {
        const controls =Game.inputs.get(entity.uid);
        let i = 0;
        const max_h_speed = 2;
        entity.velocity.x = 0;
        entity.spriteFrame+=0.2;
        entity.spriteFrame %=2;
        if( NetplayInput.getPressed(controls,CONTROLS.LEFT)){
            entity.velocity.x = -max_h_speed;
        }
        if( NetplayInput.getPressed(controls,CONTROLS.RIGHT)){
            entity.velocity.x = max_h_speed;
        }
        if(entity.velocity.x!=0){
            for (i = 0; i < max_h_speed; i+=1) {
                if(entity.velocity.x<0){//move left
                    if (!Terrain.hitTest(room.terrain, entity.position.x , entity.position.y, 1, 1)) {
                        entity.position.x -= 1;
                        if (Terrain.hitTest(room.terrain, entity.position.x, entity.position.y + entity.size.y, 1, 1)&&
                           !Terrain.hitTest(room.terrain, entity.position.x, entity.position.y -1, 1, 1)) {
                            entity.position.y -= 1;
                        }
                    }
                }else{//move right
                    if (!Terrain.hitTest(room.terrain, entity.position.x + entity.size.x, entity.position.y, 1, 1)) {
                        entity.position.x += 1;
                        if (Terrain.hitTest(room.terrain, entity.position.x + entity.size.x, entity.position.y + entity.size.y, 1, 1)&&
                            !Terrain.hitTest(room.terrain, entity.position.x + entity.size.x, entity.position.y -1, 1, 1)) {
                            entity.position.y -= 1;
                        }
                    }
                }
            }
        }
        if (NetplayInput.getPressed(controls,CONTROLS.JUMP)) {
            entity.velocity.y = -2;
        }
        entity.velocity.y+=1; 
        if(entity.velocity.y>2){entity.velocity.y=2;}//max fall speed
        if (entity.velocity.y > 0) {
            //check ground
            for (i = 0; i < entity.velocity.y; i+=1) {
                if (!Terrain.hitTest(room.terrain, entity.position.x, entity.position.y + entity.size.y, entity.size.x, 1)) {
                    entity.position.y += 1;
                } else {
                    entity.velocity.y = 0;
                }
            }
        } else {
            for (i = 0; i < Math.abs(entity.velocity.y); i+=1) {
                if (!Terrain.hitTest(room.terrain, entity.position.x, entity.position.y, entity.size.x, 1)) {
                    entity.position.y -= 1;
                } else {
                    entity.velocity.y = 0;
                }
            }
        }
        //set sprites
        //standing
        if(entity.velocity.x==0&&entity.velocity.y==0){
            //if the sprite is not alreay standing, change it to be standing but work out which way it should be facing
            if(entity.sprite == PLAYER_SPRITE.MOVING_LEFT||
                entity.sprite == PLAYER_SPRITE.FALLING_LEFT||
                entity.sprite == PLAYER_SPRITE.JUMPING_LEFT){
                entity.sprite = PLAYER_SPRITE.STANDING_LEFT;
            }
            if(entity.sprite == PLAYER_SPRITE.MOVING_RIGHT||
                entity.sprite == PLAYER_SPRITE.FALLING_RIGHT||
                entity.sprite == PLAYER_SPRITE.JUMPING_RIGHT){
                entity.sprite = PLAYER_SPRITE.STANDING_RIGHT;
            }
        }
        if(entity.velocity.y==0||entity.velocity.y==1){//if on ground
            if(entity.velocity.x>0){//and moving
                entity.sprite = PLAYER_SPRITE.MOVING_RIGHT;
            }
            if(entity.velocity.x<0){
                entity.sprite = PLAYER_SPRITE.MOVING_LEFT;
            }
        }
        if(entity.velocity.y<0){
            if(entity.sprite == PLAYER_SPRITE.MOVING_LEFT||
                entity.sprite == PLAYER_SPRITE.FALLING_LEFT||
                entity.sprite == PLAYER_SPRITE.STANDING_LEFT||
                entity.velocity.x<0){
                entity.sprite = PLAYER_SPRITE.JUMPING_LEFT;
            }
            if(entity.sprite == PLAYER_SPRITE.MOVING_RIGHT||
                entity.sprite == PLAYER_SPRITE.FALLING_RIGHT||
                entity.sprite == PLAYER_SPRITE.STANDING_RIGHT||
                entity.velocity.x>0){
                entity.sprite = PLAYER_SPRITE.JUMPING_RIGHT;
            }
        }
        if(entity.velocity.y>1){//NOTE: velocity y==1 can come from just walking
                                //only change to falling if falling for >1 frame
            if(entity.sprite == PLAYER_SPRITE.MOVING_LEFT||
                entity.sprite == PLAYER_SPRITE.JUMPING_LEFT||
                entity.sprite == PLAYER_SPRITE.STANDING_LEFT||
                entity.velocity.x<0){
                entity.sprite = PLAYER_SPRITE.FALLING_LEFT;
            }
            if(entity.sprite == PLAYER_SPRITE.MOVING_RIGHT||
                entity.sprite == PLAYER_SPRITE.JUMPING_RIGHT||
                entity.sprite == PLAYER_SPRITE.STANDING_RIGHT||
                entity.velocity.x>0){
                entity.sprite = PLAYER_SPRITE.FALLING_RIGHT;
            }
        }
        //move between rooms, going off one side means going onto another
        const buffer = 3;
        if(entity.position.x<0 && room.x>0){
            const idx = xyToIdx(room.x-1,room.y,Game.gameInstance.worldSize);
            const targetRoom = Game.gameInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.x=room.terrain.width-entity.size.x-buffer;
            if(entity.uid==Game.gameInstance.playerUid){ Game.gameInstance.currentRoom = idx; }
        }
        if(entity.position.x+entity.size.x > room.terrain.width&& room.x<Game.gameInstance.worldSize-1){
            const idx = xyToIdx(room.x+1,room.y,Game.gameInstance.worldSize);
            const targetRoom = Game.gameInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.x=buffer;
            if(entity.uid==Game.gameInstance.playerUid){ Game.gameInstance.currentRoom = idx; }
        }
        if(entity.position.y<0 && room.y>0){
            const idx = xyToIdx(room.x,room.y-1,Game.gameInstance.worldSize);
            const targetRoom = Game.gameInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.y=room.terrain.height-entity.size.y-buffer;
            if(entity.uid==Game.gameInstance.playerUid){ Game.gameInstance.currentRoom = idx; }
        }
        if(entity.position.y+entity.size.y > room.terrain.height&& room.y<Game.gameInstance.worldSize-1){
            const idx = xyToIdx(room.x,room.y+1,Game.gameInstance.worldSize);
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
                    case EuqippedKind.WEAPON_FLAMETHROWER:{
                        entity.cooldown = 1;//cooldown 
                        bulletEntity.hp = 1;//damage
                        bulletEntity.cooldown = 20;//bullet lifetime
                        const spreadAngle = 5/( 180 / Math.PI);//5 degrees in rad
                        const spread = PRNG.prng()*spreadAngle-PRNG.prng()*spreadAngle;
                        bulletEntity.velocity.x = Math.cos(aimingAngleRads+spread)*5;//speed
                        bulletEntity.velocity.y = Math.sin(aimingAngleRads+spread)*5;//speed
                        Room.AddEntity(room,bulletEntity);
                        break;
                    }
                    case EuqippedKind.WEAPON_MACHINEGUN:{
                        entity.cooldown = 5;//cooldown 
                        bulletEntity.hp = 5;//damage
                        bulletEntity.cooldown = 100;//bullet lifetime
                        const spreadAngle = 2/( 180 / Math.PI);
                        const spread = PRNG.prng()*spreadAngle-PRNG.prng()*spreadAngle;
                        bulletEntity.velocity.x = Math.cos(aimingAngleRads+spread)*10;//speed
                        bulletEntity.velocity.y = Math.sin(aimingAngleRads+spread)*10;//speed
                        Room.AddEntity(room,bulletEntity);
                        break;
                    }
                    case EuqippedKind.WEAPON_SNIPER:{
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
        //==mining
        if (NetplayInput.getPressed(controls,CONTROLS.MINE)) {
            const mineEntity = new Entity();
            mineEntity.kind = EntityKind.Bullet;
            mineEntity.euqipped = EuqippedKind.WEAPON_MINE;//bullet type match the weapon that shot it
            mineEntity.size.x = 2;
            mineEntity.size.y = 2;

            const mousePos =controls.mousePosition;
            const aimingAngleRads = Math.atan2(mousePos.y-entity.position.y,mousePos.x-entity.position.x) ;//* 180 / Math.PI to get deg
            mineEntity.position.x = entity.position.x+Math.floor(entity.size.x/2+Math.cos(aimingAngleRads)*(entity.size.x/2+2));
            mineEntity.position.y = entity.position.y+Math.floor(entity.size.y/2+Math.sin(aimingAngleRads)*(entity.size.y/2+2));
            /*const facingLeft = (entity.sprite == PLAYER_SPRITE.MOVING_LEFT||
                    entity.sprite == PLAYER_SPRITE.FALLING_LEFT||
                    entity.sprite == PLAYER_SPRITE.JUMPING_LEFT||
                    entity.sprite == PLAYER_SPRITE.STANDING_LEFT);*/
            mineEntity.cooldown = 1;
            Room.AddEntity(room,mineEntity);
        }

    }
    static draw(ctx:CanvasRenderingContext2D,entity:Entity){
        const image = ImageCache.getImage("./media/sprites.png");
        if (!image.loaded){return;}
        let spr = sprites.driller_stand1;
        let flipX =false;
        if(entity.sprite == PLAYER_SPRITE.STANDING_LEFT){
            spr =sprites.driller_stand1;
            flipX = true;
        }
        if(entity.sprite == PLAYER_SPRITE.STANDING_RIGHT){
            spr =sprites.driller_stand1;
            flipX = false;
        }
        if(entity.sprite == PLAYER_SPRITE.MOVING_LEFT){
            spr = Math.floor(entity.spriteFrame)==0?
                sprites.driller_stand1:
                sprites.driller_stand2;
            flipX = true;
        }
        if(entity.sprite == PLAYER_SPRITE.MOVING_RIGHT){
            spr = Math.floor(entity.spriteFrame)==0?
                sprites.driller_stand1:
                sprites.driller_stand2;
            flipX = false;
        }
        if(entity.sprite == PLAYER_SPRITE.JUMPING_LEFT){
            spr = Math.floor(entity.spriteFrame)==0?
                sprites.driller_jet1:
                sprites.driller_jet2;
            flipX = true;
        }
        if(entity.sprite == PLAYER_SPRITE.JUMPING_RIGHT){
            spr = Math.floor(entity.spriteFrame)==0?
                sprites.driller_jet1:
                sprites.driller_jet2;
            flipX = false;
        }
        if(entity.sprite == PLAYER_SPRITE.FALLING_LEFT){
            spr = Math.floor(entity.spriteFrame)==0?
                sprites.driller_fall1:
                sprites.driller_fall2;
            flipX = true;
        }
        if(entity.sprite == PLAYER_SPRITE.FALLING_RIGHT){
            spr = Math.floor(entity.spriteFrame)==0?
                sprites.driller_fall1:
                sprites.driller_fall2;
            flipX = false;
        }
        ImageCache.drawTile(ctx,image,entity.position.x,entity.position.y,
            spr.x,spr.y,spr.w,spr.h,flipX,false);
    }
}
export {Player,PLAYER_SPRITE}//PLAYER_SPRITE is only exported for tests