import { EntityKind, EuqippedKind, xyToIdx } from "./types.mjs";
import { Entity } from "./Entity.mjs";
import { Terrain } from "./Terrain.mjs";
import { Game } from "./Game.mjs";
import { FONT_WIDTH,FONT_HEIGHT,LETTER_H,LETTER_W,font } from "./sprites.mjs";
import { ImageCache } from "./ImageCache.mjs";
import { ResourceConfig } from "./Config/ResourceConfig.mjs";
import { PlayerConfig } from "./Config/PlayerConfig.mjs";
class Room{
    idx:number;
    x:number;
    y:number;
    entities:Array<Entity>;
    maxEntities:number;
    terrain:Terrain;
    players:Set<number>;//record which players are in the room for fast lookup
    locked_L:boolean;
    locked_R:boolean;
    locked_U:boolean;
    locked_D:boolean;
    constructor(){
        this.entities = [];
        this.maxEntities = 0;
        this.players = new Set();
        this.locked_L = false;
        this.locked_R = false;
        this.locked_U = false;
        this.locked_D = false;
    }
    static MoveEntity(startRoom:Room,endRoom:Room,entity:Entity){
        //note: if moving in one direction, 
        //can be processed multiple times per frame depending on how rooms are sweept in update() 
        //to avoid aliasing bug, need to replace the 'remove' with a new instance, then remove that
        //then can take the original entity and put it into another room
        const entRemover = new Entity();
        entRemover.roomId = entity.roomId;
        entRemover.kind = entity.kind;
        startRoom.entities[entity.roomId] = entRemover;
        Room.RemoveEntity(startRoom,entRemover);
        Room.AddEntity(endRoom,entity);
    }
    static AddEntity(room:Room,entity:Entity){
        if(room.maxEntities==room.entities.length){
            room.entities.push(entity);
        }else{
            room.entities[room.maxEntities] = entity;// Entity.apply(entity,room.entities[room.maxEntities]);
        }
        entity.roomId = room.maxEntities;
        room.maxEntities+=1;
        if(entity.kind==EntityKind.Player){
            room.players.add(entity.roomId);
            const cfg = Game.gameInstance.playerLiveCount.get(entity.uid);
            if(cfg){//should only be null when unit testing 
                cfg.roomId = entity.roomId;
                cfg.roomIdx = room.idx;
            }
        }
    }
    static RemoveEntity(room:Room,entity:Entity){
        const idxToRemove = entity.roomId;
        if(idxToRemove==-1){return;}//entity was already destroyed earlier
        const lastEnt = room.entities[room.maxEntities-1];
        if(lastEnt.roomId!= entity.roomId){//if it's already at the end, can skip the swap
            room.entities[idxToRemove] = lastEnt;//swap element
            room.entities[room.maxEntities-1] = entity;//ensure the references are swapped, so that we don't end up with aliasing
            lastEnt.roomId = idxToRemove;
        }
        if(entity.kind==EntityKind.Player){room.players.delete(entity.roomId);}
        entity.roomId = -1;
        if(room.maxEntities>0){
            room.maxEntities-=1;
        }
    }
    static update(room:Room){
        for(let i=room.maxEntities-1;i>=0;i-=1){
            const ent = room.entities[i];
            Entity.update(room,ent);
        }
    }
    static draw(ctx:CanvasRenderingContext2D,room:Room){
        Terrain.draw(ctx,room.terrain);
        for(let i=room.maxEntities-1;i>=0;i-=1){
            const ent = room.entities[i];
            Entity.draw(ctx,ent);
        }
        if(Game.inputs){
            const controls =Game.inputs.get(Game.gameInstance.playerUid);
            if(controls.mousePosition){
                ctx.strokeStyle = '1px solid black';
                ctx.beginPath();
                ctx.arc(Math.floor(controls.mousePosition.x)-0.5,Math.floor(controls.mousePosition.y)-0.5,10,0,Math.PI*2);
                ctx.stroke();
            }
        }
        ctx.fillStyle = "#FF0000";
        //red line on locked sides
        if(room.locked_D||room.y==Game.gameInstance.worldSize-1){
            ctx.fillRect(0,room.terrain.height-2,room.terrain.width,2);
        }
        if(room.locked_U||room.y==0){
            ctx.fillRect(0,0,room.terrain.width,2);
        }
        if(room.locked_L||room.x==0 ){
            ctx.fillRect(0,0,2,room.terrain.height);
        }
        if(room.locked_R||room.x==Game.gameInstance.worldSize-1){
            ctx.fillRect(room.terrain.width-2,0,2,room.terrain.height);
        }
        UI.draw(ctx,room);
    }

}

class UI{
    static draw(ctx:CanvasRenderingContext2D,room:Room){
        //have: 64 px from right 
        //      72 px from bottom
        //draws room-based UI elements (i.e. global UI elements)
        //minimap
        UI.#drawMinimap(ctx,room);
        //objectives
        UI.#drawOverview(ctx,room);
    }
    static #drawMinimap(ctx:CanvasRenderingContext2D,room:Room){
        //render a 64x128 stripe of the global map, scaled to 2x2 pixels (32x64 operations)
        //center on the player
        
        //try render 3x3 room preview of world, noting that more height is visible
        
        //this gives a scale factor of 12 ==((256*3)/64)
        //start at playerX,Y
        const saleFactor = 6;//scale factor of 6 gives 1 px squares, 12 would need 2 px squares and 1/2 x,y
        
        const localPlayer= Game.gameInstance.playerLiveCount.get(Game.gameInstance.playerUid);
        const playerEntity = Game.gameInstance.rooms[localPlayer.roomIdx].entities[localPlayer.roomId];
        const playerX=Math.floor(playerEntity.position.x/saleFactor)*saleFactor+room.x*room.terrain.width;
        const playerY=Math.floor(playerEntity.position.y/saleFactor)*saleFactor+room.y*room.terrain.height;
        const left = room.terrain.width;
        ctx.fillStyle="#AAAAAA";
        for(let x=-32;x<=32;x+=1){
            for(let y=-64;y<=64;y+=1){
                const worldX = playerX+x*saleFactor;
                const worldY = playerY+y*saleFactor;
                //calculate the room and sample terrain from that world position
                if(worldX>=0&&worldX<room.terrain.width*Game.gameInstance.worldSize &&
                    worldY>=0&&worldY<room.terrain.height*Game.gameInstance.worldSize){
                        const roomX = Math.floor(worldX/room.terrain.width);
                        const roomY = Math.floor(worldY/room.terrain.height);
                        const roomIdx = xyToIdx(roomX,roomY,Game.gameInstance.worldSize);//which room the point is in...
                        const worldRoom = Game.gameInstance.rooms[roomIdx];
                        //sample the point from the room
                        let pointX =worldX-worldRoom.x*room.terrain.width;
                        let pointY =worldY-worldRoom.y*room.terrain.height;
                        if(pointX<=1){pointX=1;}
                        if(pointY<=1){pointY=1;}
                        const filled = Terrain.getBit(pointX,pointY,worldRoom.terrain);
                        if(filled){//draw
                            ctx.fillRect(left+(x+32)*1,0+(y+64)*1,1,1);
                        }
                }
            }
        }
        const chCl = Game.gameInstance.playerConfig.get(playerEntity.uid)?.chosenClass;
        if(chCl==PlayerConfig.CLASSES.DRILLER){//yellow
            ctx.fillStyle = "#FFFF00";
        }
        if(chCl==PlayerConfig.CLASSES.SCOUT){//blue
            ctx.fillStyle = "#0000FF";
        }
        if(chCl==PlayerConfig.CLASSES.ENGINEER){//red
            ctx.fillStyle = "#FF0000";

        }
        if(chCl==PlayerConfig.CLASSES.GUNNER){//green
            ctx.fillStyle = "#00FF00";
        }
        ctx.fillRect(left+32,64,2,2);
        

    }

    static #drawOverview(ctx:CanvasRenderingContext2D,room:Room){
        const objectiveX = room.terrain.width;
        let objectiveY = 128;
        UI.drawText(ctx,"-MISSION-",objectiveX,objectiveY);
        objectiveY+=LETTER_H;
        if(Game.gameInstance.missionConfig.chosenPrimary == ResourceConfig.PRIMARY_OBJECTIVE.EGG_HUNT){
            const objectiveStatus = Game.gameInstance.resourceLiveCount.egg+"/"+Game.gameInstance.missionConfig.goalPrimary;
            UI.drawText(ctx,"Egg Hunt:",objectiveX,objectiveY);
            objectiveY+=LETTER_H;
            UI.drawText(ctx,"    "+objectiveStatus,objectiveX,objectiveY);
        }
        if(Game.gameInstance.missionConfig.chosenPrimary == ResourceConfig.PRIMARY_OBJECTIVE.MINING_EXPEDITION){
            const objectiveStatus = Game.gameInstance.resourceLiveCount.bismore+"/"+Game.gameInstance.missionConfig.goalPrimary;
            UI.drawText(ctx,"Mining:",objectiveX,objectiveY);
            objectiveY+=LETTER_H;
            UI.drawText(ctx,"    "+objectiveStatus,objectiveX,objectiveY);
        }
        if(Game.gameInstance.missionConfig.chosenPrimary == ResourceConfig.PRIMARY_OBJECTIVE.POINT_EXTRACTION){
            const objectiveStatus = Game.gameInstance.resourceLiveCount.aquarq+"/"+Game.gameInstance.missionConfig.goalPrimary;
            UI.drawText(ctx,"Extract:",objectiveX,objectiveY);
            objectiveY+=LETTER_H;
            UI.drawText(ctx,"    "+objectiveStatus,objectiveX,objectiveY);
        }
        objectiveY+=LETTER_H;
        if(Game.gameInstance.missionConfig.chosenSecondary == ResourceConfig.SECONDARY_OBJECTIVE.FOSSIL){
            const objectiveStatus = Game.gameInstance.resourceLiveCount.fossil+"/"+Game.gameInstance.missionConfig.goalSecondary;
            UI.drawText(ctx,"Fossil:",objectiveX,objectiveY);
            objectiveY+=LETTER_H;
            UI.drawText(ctx,"    "+objectiveStatus,objectiveX,objectiveY);
        }
        objectiveY+=LETTER_H;
        UI.drawText(ctx,"Gold: "+ Game.gameInstance.resourceLiveCount.gold,objectiveX,objectiveY);

    }
    static drawText(ctx:CanvasRenderingContext2D,text:string,x:number,y:number){
        const image = ImageCache.getImage("./media/font-pixel-simplicity_grey.png");
        if (!image.loaded){return;}
        for(let i=0;i<text.length;i+=1){
            const char = text.charAt(i);
            const fontLett = (font as any)[char];
            ImageCache.drawTile(ctx,image,x+i*LETTER_W,y,fontLett.x,fontLett.y,LETTER_W,LETTER_H,false,false);
        }
    }
    
}
export {Room}