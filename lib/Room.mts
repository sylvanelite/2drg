import { EntityKind } from "./types.mjs";
import { Entity } from "./Entity.mjs";
import {Terrain} from "./Terrain.mjs";
import { Game } from "./Game.mjs";
class Room{
    idx:number;
    x:number;
    y:number;
    entities:Array<Entity>;
    maxEntities:number;
    terrain:Terrain;
    players:Set<number>;//record which players are in the room for fast lookup
    static MAX_ENTIES = 500;
    constructor(){
        this.entities = [];
        this.maxEntities = 0;
        this.players = new Set();
    }
    static MoveEntity(startRoom:Room,endRoom:Room,entity:Entity){
        //note: if moving in one direction, 
        //can be processed multiple times per frame depending on how rooms are sweept in update() 
        //to avoid aliasing bug, need to replace the 'remove' with a new instance, then remove that
        //then can take the original entity and put it into another room
        const entRemover = new Entity();
        entRemover.roomId = entity.roomId;
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
        if(entity.kind==EntityKind.Player){room.players.add(entity.roomId);}
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
    }

}
export {Room}