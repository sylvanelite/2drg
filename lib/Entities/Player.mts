

import { NetplayInput } from "../netPeer/netplayInput.mjs";
import { xyToIdx,CONTROLS,EntityKind,PRNG,EuqippedKind } from "../types.mjs";
import { Entity } from "../Entity.mjs";
import { Room } from "../Room.mjs";
import { Terrain } from "../Terrain.mjs";
import { Game } from '../Game.mjs'
import { ImageCache } from "../ImageCache.mjs";
import { sprites,IMAGE_HEIGHT,IMAGE_WIDTH } from "../sprites.mjs";
import { PlayerConfig } from "../Config/PlayerConfig.mjs";
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
        const max_h_speed = 1;
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
        if(entity.position.x<0 && room.x>0 && !room.locked_L){
            const idx = xyToIdx(room.x-1,room.y,Game.gameInstance.worldSize);
            const targetRoom = Game.gameInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.x=room.terrain.width-entity.size.x-buffer;
            if(entity.uid==Game.gameInstance.playerUid){ Game.gameInstance.currentRoom = idx; }
        }
        if(entity.position.x+entity.size.x > room.terrain.width&& room.x<Game.gameInstance.worldSize-1 && !room.locked_R){
            const idx = xyToIdx(room.x+1,room.y,Game.gameInstance.worldSize);
            const targetRoom = Game.gameInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.x=buffer;
            if(entity.uid==Game.gameInstance.playerUid){ Game.gameInstance.currentRoom = idx; }
        }
        if(entity.position.y<0 && room.y>0 && !room.locked_U){
            const idx = xyToIdx(room.x,room.y-1,Game.gameInstance.worldSize);
            const targetRoom = Game.gameInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.y=room.terrain.height-entity.size.y-buffer;
            if(entity.uid==Game.gameInstance.playerUid){ Game.gameInstance.currentRoom = idx; }
        }
        if(entity.position.y+entity.size.y > room.terrain.height&& room.y<Game.gameInstance.worldSize-1 && !room.locked_D){
            const idx = xyToIdx(room.x,room.y+1,Game.gameInstance.worldSize);
            const targetRoom = Game.gameInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.y =buffer;
            if(entity.uid==Game.gameInstance.playerUid){ Game.gameInstance.currentRoom = idx; }
        }
        //if hit edge of map, or edge of locked room, prevent going out-of-bounds
        if(entity.position.x<0){ entity.position.x=1;}
        if(entity.position.y<0){ entity.position.y=1;}
        if(entity.position.x+entity.size.x > room.terrain.width){ entity.position.x=room.terrain.width-entity.size.x-1;}
        if(entity.position.y+entity.size.y > room.terrain.height){ entity.position.y=room.terrain.height-entity.size.y-1;}
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
                        const spreadAngle = 3/( 180 / Math.PI);//5 degrees in rad
                        const spread = PRNG.prng()*spreadAngle-PRNG.prng()*spreadAngle;
                        bulletEntity.velocity.x = Math.cos(aimingAngleRads+spread)*(2+PRNG.prng()*3);//speed
                        bulletEntity.velocity.y = Math.sin(aimingAngleRads+spread)*(2+PRNG.prng()*3);//speed
                        Room.AddEntity(room,bulletEntity);
                        break;
                    }
                    case EuqippedKind.WEAPON_MACHINEGUN:{
                        entity.cooldown = 5;//cooldown 
                        bulletEntity.hp = 5;//damage
                        bulletEntity.cooldown = 100;//bullet lifetime
                        bulletEntity.velocity.x = Math.cos(aimingAngleRads)*10;//speed
                        bulletEntity.velocity.y = Math.sin(aimingAngleRads)*10;//speed
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
        if(entity.secondaryCooldown>0){
            entity.secondaryCooldown-=1;
        }
        if (entity.secondaryCooldown==0&&NetplayInput.getPressed(controls,CONTROLS.MINE)) {
            entity.secondaryCooldown=10;
            const mineEntity = new Entity();
            mineEntity.kind = EntityKind.Bullet;
            mineEntity.euqipped = EuqippedKind.WEAPON_MINE;//bullet type match the weapon that shot it
            mineEntity.size.x = 2;
            mineEntity.size.y = 2;

            mineEntity.position.x = entity.position.x+Math.floor(entity.size.x/2);
            mineEntity.position.y = entity.position.y+Math.floor(entity.size.y/2);
            mineEntity.cooldown = 1;
            Room.AddEntity(room,mineEntity);
        }

    }
    static draw(ctx:CanvasRenderingContext2D,entity:Entity){
        const image = ImageCache.getImage("./media/sprites.png");
        if (!image.loaded){return;}
        let spr_stand1 = sprites.driller_stand1;
        let spr_stand2 = sprites.driller_stand2;
        let spr_jet1 = sprites.driller_jet1;
        let spr_jet2 = sprites.driller_jet2;
        let spr_fall1 = sprites.driller_fall1;
        let spr_fall2 = sprites.driller_fall2;
        let spr = spr_stand1;
        const chCl = Game.gameInstance.playerConfig.get(entity.uid)?.chosenClass;
        if(chCl == PlayerConfig.CLASSES.DRILLER){
            spr_stand1 = sprites.driller_stand1;
            spr_stand2 = sprites.driller_stand2;
            spr_jet1 = sprites.driller_jet1;
            spr_jet2 = sprites.driller_jet2;
            spr_fall1 = sprites.driller_fall1;
            spr_fall2 = sprites.driller_fall2;
        }
        if(chCl == PlayerConfig.CLASSES.ENGINEER){
            spr_stand1 = sprites.engineer_stand1;
            spr_stand2 = sprites.engineer_stand2;
            spr_jet1 = sprites.engineer_jet1;
            spr_jet2 = sprites.engineer_jet2;
            spr_fall1 = sprites.engineer_fall1;
            spr_fall2 = sprites.engineer_fall2;
        }
        if(chCl == PlayerConfig.CLASSES.SCOUT){
            spr_stand1 = sprites.scout_stand1;
            spr_stand2 = sprites.scout_stand2;
            spr_jet1 = sprites.scout_jet1;
            spr_jet2 = sprites.scout_jet2;
            spr_fall1 = sprites.scout_fall1;
            spr_fall2 = sprites.scout_fall2;
        }
        if(chCl == PlayerConfig.CLASSES.GUNNER){
            spr_stand1 = sprites.gunner_stand1;
            spr_stand2 = sprites.gunner_stand2;
            spr_jet1 = sprites.gunner_jet1;
            spr_jet2 = sprites.gunner_jet2;
            spr_fall1 = sprites.gunner_fall1;
            spr_fall2 = sprites.gunner_fall2;
        }
        let flipX =false;
        if(entity.sprite == PLAYER_SPRITE.STANDING_LEFT){
            spr =spr_stand1;
            flipX = true;
        }
        if(entity.sprite == PLAYER_SPRITE.STANDING_RIGHT){
            spr =spr_stand1;
            flipX = false;
        }
        if(entity.sprite == PLAYER_SPRITE.MOVING_LEFT){
            spr = Math.floor(entity.spriteFrame)==0?
                spr_stand1:
                spr_stand2;
            flipX = true;
        }
        if(entity.sprite == PLAYER_SPRITE.MOVING_RIGHT){
            spr = Math.floor(entity.spriteFrame)==0?
                spr_stand1:
                spr_stand2;
            flipX = false;
        }
        if(entity.sprite == PLAYER_SPRITE.JUMPING_LEFT){
            spr = Math.floor(entity.spriteFrame)==0?
                spr_jet1:
                spr_jet2;
            flipX = true;
        }
        if(entity.sprite == PLAYER_SPRITE.JUMPING_RIGHT){
            spr = Math.floor(entity.spriteFrame)==0?
                spr_jet1:
                spr_jet2;
            flipX = false;
        }
        if(entity.sprite == PLAYER_SPRITE.FALLING_LEFT){
            spr = Math.floor(entity.spriteFrame)==0?
                spr_fall1:
                spr_fall2;
            flipX = true;
        }
        if(entity.sprite == PLAYER_SPRITE.FALLING_RIGHT){
            spr = Math.floor(entity.spriteFrame)==0?
                spr_fall1:
                spr_fall2;
            flipX = false;
        }
        ImageCache.drawTile(ctx,image,entity.position.x,entity.position.y,
            spr.x,spr.y,spr.w,spr.h,flipX,false);
        Player.drawUI(ctx,entity);
    }
    static drawUI(ctx:CanvasRenderingContext2D,entity:Entity){
        const image = ImageCache.getImage("./media/sprites.png");
        if (!image.loaded){return;}
        let spr = sprites.player_driller;
        const chCl = Game.gameInstance.playerConfig.get(entity.uid)?.chosenClass;
        if(chCl == PlayerConfig.CLASSES.DRILLER){
            spr = sprites.player_driller;
        }
        if(chCl == PlayerConfig.CLASSES.ENGINEER){
            spr = sprites.player_engineer;
        }
        if(chCl == PlayerConfig.CLASSES.SCOUT){
            spr = sprites.player_scout;
        }
        if(chCl == PlayerConfig.CLASSES.GUNNER){
            spr = sprites.player_gunner;
        }
        let chNo = sprites.player1;
        if(entity.uid==0){chNo = sprites.player1;}
        if(entity.uid==1){chNo = sprites.player2;}
        if(entity.uid==2){chNo = sprites.player3;}
        if(entity.uid==3){chNo = sprites.player4;}
        //draw order:
        //bg
        //player chCl
        //player number
        //entity stats
        const left = entity.uid*sprites.player_bg.w;
        const top = ctx.canvas.height-sprites.player_bg.h;
        ImageCache.drawTile(ctx,image,left,top,
            sprites.player_bg.x,sprites.player_bg.y,sprites.player_bg.w,sprites.player_bg.h,false,false);
        ImageCache.drawTile(ctx,image,left,top,
            spr.x,spr.y,spr.w,spr.h,false,false);
        ImageCache.drawTile(ctx,image,left,ctx.canvas.height-chNo.h,
            chNo.x,chNo.y,chNo.w,chNo.h,false,false);
        //TODO: stats
        /*
        heart:8px wide
        bg:64 wide, with 24 being the LHS image=40px left
        5 hearts = 40px
        maxHp=100, 100/5 = 20
        */
        let heartX = left+chNo.w;
        for(let i=0;i<entity.maxHp;i+=20){
            if(entity.hp<i){break;}
            ImageCache.drawTile(ctx,image,heartX,top,
                sprites.heart.x,sprites.heart.y,sprites.heart.w,sprites.heart.h,false,false);
            heartX+=sprites.heart.w;
        }

    }
}
export {Player,PLAYER_SPRITE}//PLAYER_SPRITE is only exported for tests