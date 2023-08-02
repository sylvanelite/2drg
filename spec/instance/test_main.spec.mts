import { Game } from "../../lib/Game.mjs";
import { Room } from "../../lib/Room.mjs";
import { PlayerConfig } from "../../lib/Entities/PlayerConfig.mjs";

const canvasMock = {
    getContext:()=>{
        return {};
    },
    addEventListener:()=>{},
    parentElement:{addEventListener:()=>{}}
};
describe("test main",function(){
	it("check creation",async function() {
        Game.gameInstance = new Game(canvasMock as any);
        expect(Game.gameInstance).not.toBeNull();
    });
	it("check init",async function() {
        Game.gameInstance = new Game(canvasMock as any);
        Game.gameInstance.worldSize = 2;//init is slow, get better test perf by dropping world size
        const [playerId,playerCount] = [0,1];
        const playerConfig = new PlayerConfig();
        Game.gameInstance.init(playerId,[playerConfig]);
        expect(Game.gameInstance.rooms.length).toBe(Game.gameInstance.worldSize*Game.gameInstance.worldSize);
        expect(Game.gameInstance.playerUid).toBe(playerId);
    });
});

describe("test serialisation",function(){
	it("serialise/desertialise",async function() {
        Game.gameInstance = new Game(canvasMock as any);
        Game.gameInstance.worldSize = 2;
        const [playerId,playerCount] = [0,1];
        const playerConfig = new PlayerConfig();
        Game.gameInstance.init(playerId,[playerConfig]);
        const serial = Game.gameInstance.serialize();
        //count how many entities are spawned into each room
        const entityCounts = Array(Game.gameInstance.rooms.length);
        const terrainSample = Array(Game.gameInstance.rooms.length);
        for(let i=0;i<Game.gameInstance.rooms.length;i+=1){
            entityCounts[i] = Game.gameInstance.rooms[i].maxEntities;
            terrainSample[i] = Game.gameInstance.rooms[i].terrain.terrain[64];//read out an arbitrary section of terrain
        }
        //change the rooms by removing all entities
        for(const room of Game.gameInstance.rooms){
            for(let i=room.maxEntities-1;i>=0;i-=1){
                const ent = room.entities[i];
                Room.RemoveEntity(room,ent);
                room.terrain.terrain[64] = 0;
            }
        }
        //assert all entities are removed
        for(let i=0;i<Game.gameInstance.rooms.length;i+=1){
            expect(Game.gameInstance.rooms[i].maxEntities).toBe(0);
            expect(Game.gameInstance.rooms[i].terrain.terrain[64]).toBe(0);
        }
        //check deserialising restores entities
        Game.gameInstance.deserialize(serial);
        for(let i=0;i<Game.gameInstance.rooms.length;i+=1){
            expect(Game.gameInstance.rooms[i].maxEntities).toBe(entityCounts[i]);
            expect(Game.gameInstance.rooms[i].terrain.terrain[64]).toBe(terrainSample[i]);
        }
        
    });
});

