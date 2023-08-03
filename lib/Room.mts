import { EntityKind } from "./types.mjs";
import { Entity } from "./Entity.mjs";
import { Terrain } from "./Terrain.mjs";
import { Game } from "./Game.mjs";
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
            if(Game.gameInstance){//should only be null when unit testing 
                const cfg = Game.gameInstance.playerLiveCount.get(entity.uid);
                if(cfg){//should only be null when unit testing 
                    cfg.roomId = entity.roomId;
                    cfg.roomIdx = room.idx;
                }
            }
        }
    }
    static RemoveEntity(room:Room,entity:Entity){
        const idxToRemove = entity.roomId;
        if(idxToRemove==-1){return;}//entity was already destroyed earlier
        const lastEnt = room.entities[room.maxEntities-1];
        if(lastEnt.roomId!= entity.roomId){//if it's already at the end, can skip the swap
            if(lastEnt.kind==EntityKind.Player){//if swapping with a player, update tracking 
                room.players.delete(lastEnt.roomId); 
            }
            room.entities[idxToRemove] = lastEnt;//swap element
            room.entities[room.maxEntities-1] = entity;//ensure the references are swapped, so that we don't end up with aliasing
            lastEnt.roomId = idxToRemove;
            if(lastEnt.kind==EntityKind.Player){ 
                room.players.add(lastEnt.roomId);
                if(Game.gameInstance){//should only be null when unit testing 
                    const cfg = Game.gameInstance.playerLiveCount.get(lastEnt.uid);
                    if(cfg){//should only be null when unit testing 
                        cfg.roomId = lastEnt.roomId;
                        cfg.roomIdx = room.idx;
                    }
                }
                
            }
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
    }

}

export {Room}