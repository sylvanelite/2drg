import { EntityKind, EuqippedKind, xyToIdx } from "./types.mjs";
import { Entity } from "./Entity.mjs";
import { Terrain } from "./Terrain.mjs";
import { Game } from "./Game.mjs";
import { FONT_WIDTH,FONT_HEIGHT,LETTER_H,LETTER_W,font } from "./sprites.mjs";
import { ImageCache } from "./ImageCache.mjs";
import { ResourceConfig } from "./Config/ResourceConfig.mjs";
import { PlayerConfig } from "./Config/PlayerConfig.mjs";
import { Room } from "./Room.mjs";
class UI{
    static draw(ctx:CanvasRenderingContext2D){
        //have: 64 px from right 
        //      72 px from bottom
        //draws room-based UI elements (i.e. global UI elements)
        //minimap
        UI.#drawMinimap(ctx);
        //objectives
        UI.#drawOverview(ctx);
    }
    static #drawMinimap(ctx:CanvasRenderingContext2D){
        //render a 64x128 stripe of the global map, scaled to 2x2 pixels (32x64 operations)
        //center on the player
        
        //try render 3x3 room preview of world, noting that more height is visible
        
        //this gives a scale factor of 12 ==((256*3)/64)
        //start at playerX,Y
        const saleFactor = 6;//scale factor of 6 gives 1 px squares, 12 would need 2 px squares and 1/2 x,y
        
        const localPlayer= Game.gameInstance.playerLiveCount.get(Game.gameInstance.playerUid);
        const localRoom  = Game.gameInstance.rooms[localPlayer.roomIdx];
        const terrainWidth = localRoom.terrain.width;
        const terrainHeight = localRoom.terrain.height;
        const playerEntity = localRoom.entities[localPlayer.roomId];
        const playerX=Math.floor(playerEntity.position.x/saleFactor)*saleFactor+localRoom.x*terrainWidth;
        const playerY=Math.floor(playerEntity.position.y/saleFactor)*saleFactor+localRoom.y*terrainHeight;
        const left = terrainWidth;
        ctx.fillStyle="#AAAAAA";
        for(let x=-32;x<=32;x+=1){
            for(let y=-64;y<=64;y+=1){
                const worldX = playerX+x*saleFactor;
                const worldY = playerY+y*saleFactor;
                //calculate the room and sample terrain from that world position
                if(worldX>=0&&worldX<terrainWidth*Game.gameInstance.worldSize &&
                    worldY>=0&&worldY<terrainHeight*Game.gameInstance.worldSize){
                        const roomX = Math.floor(worldX/terrainWidth);
                        const roomY = Math.floor(worldY/terrainHeight);
                        const roomIdx = xyToIdx(roomX,roomY,Game.gameInstance.worldSize);//which room the point is in...
                        const worldRoom = Game.gameInstance.rooms[roomIdx];
                        //sample the point from the room
                        let pointX =worldX-worldRoom.x*terrainWidth;
                        let pointY =worldY-worldRoom.y*terrainHeight;
                        if(pointX<=1){pointX=1;}
                        if(pointY<=1){pointY=1;}
                        const filled = Terrain.getBit(pointX,pointY,worldRoom.terrain);
                        if(filled){//draw
                            ctx.fillRect(left+(x+32)*1,0+(y+64)*1,1,1);
                        }
                }
            }
        }
        //draw player(s) ontop of the minimap
        for(const [uid,p] of Game.gameInstance.playerLiveCount){
            const pRoom = Game.gameInstance.rooms[p.roomIdx];
            const pEnt = pRoom.entities[p.roomId];
            const px=Math.floor(pEnt.position.x/saleFactor)*saleFactor+pRoom.x*terrainWidth;
            const py=Math.floor(pEnt.position.y/saleFactor)*saleFactor+pRoom.y*terrainHeight;
            const hDist = Math.floor((playerX-px)/saleFactor);
            const vDist = Math.floor((playerY-py)/saleFactor);
            if(Math.abs(hDist)>32||Math.abs(vDist)>64){
                continue;//other playr too far away, don't draw
            }
            const chCl = Game.gameInstance.playerConfig.get(uid)?.chosenClass;
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
            ctx.fillRect(left+32-hDist,64-vDist,2,2);
        }
        

    }

    static #drawOverview(ctx:CanvasRenderingContext2D){
        const localPlayer= Game.gameInstance.playerLiveCount.get(Game.gameInstance.playerUid);
        const localRoom  = Game.gameInstance.rooms[localPlayer.roomIdx];
        const terrainWidth = localRoom.terrain.width;
        const objectiveX = terrainWidth;
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
export {UI}