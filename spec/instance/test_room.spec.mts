import { Room } from "../../lib/Room.mjs";
import { Entity } from "../../lib/Entity.mjs";
import { EntityKind } from "../../lib/types.mjs";

const assertRoomEntities = (room:Room)=>{
    //assert room max entities is not larger than the backing array
    expect(room.maxEntities).toBeLessThanOrEqual(room.entities.length);
    //assert that only 'live' entites exist in the max portion of the room
    const liveIds = new Set();
    const liveUids = new Set();
    for(let i=0;i<room.maxEntities;i+=1){
        expect(room.entities[i].roomId).not.toBe(-1);
        liveIds.add(room.entities[i].roomId);
        liveUids.add(room.entities[i].uid);
    }
    //assert that each 'live' entry is a unique object
    //(if there's a duplicated id, the set will remove it and the count won't match)
    expect(liveIds.size).toBe(room.maxEntities);
    expect(liveUids.size).toBe(room.maxEntities);
};

describe("test room",function(){
	it("add entities",async function() {
        const room = new Room();
        for(let i=0;i<100;i+=1){
            Room.AddEntity(room,new Entity());
        }
        expect(room.maxEntities).toBe(100);
        assertRoomEntities(room);
    });
	it("add and remove entities",async function() {
        const room = new Room();
        for(let i=0;i<100;i+=1){
            const e = new Entity();
            Room.AddEntity(room,e);
            if(i>=50){
                Room.RemoveEntity(room,e);
            }
        }
        expect(room.maxEntities).toBe(50);
        assertRoomEntities(room);
    });
	it("repeated entity remove",async function() {
        const room = new Room();
        for(let i=0;i<100;i+=1){
            const e = new Entity();
            Room.AddEntity(room,e);
            if(i>=50){
                Room.RemoveEntity(room,e);
                Room.RemoveEntity(room,e);
                Room.RemoveEntity(room,e);
                Room.RemoveEntity(room,e);
                Room.RemoveEntity(room,e);
            }
        }
        expect(room.maxEntities).toBe(50);
        assertRoomEntities(room);
    });
    it("move entities",async function() {
        const roomA = new Room();
        const roomB = new Room();
        for(let i=0;i<100;i+=1){
            const e = new Entity();
            Room.AddEntity(roomA,e);
            if(i>=50){
                Room.MoveEntity(roomA,roomB,e);
            }
        }
        expect(roomA.maxEntities).toBe(50);
        expect(roomB.maxEntities).toBe(50);
        assertRoomEntities(roomA);
        assertRoomEntities(roomB);
    });
	it("remove from middle",async function() {
        //removing from middle triggers swap
        const room = new Room();
        for(let i=0;i<100;i+=1){
            const e = new Entity();
            Room.AddEntity(room,e);
        }
        for(let i=25;i<50;i+=1){
            const e = room.entities[i];
            Room.RemoveEntity(room,e);
        }
        expect(room.maxEntities).toBe(75);
        assertRoomEntities(room);
    });
	it("move from middle",async function() {
        //removing from middle triggers swap
        const roomA = new Room();
        const roomB = new Room();
        for(let i=0;i<100;i+=1){
            const e = new Entity();
            Room.AddEntity(roomA,e);
        }
        for(let i=25;i<50;i+=1){
            const e = roomA.entities[i];
            Room.MoveEntity(roomA,roomB,e);
        }
        expect(roomA.maxEntities).toBe(75);
        expect(roomB.maxEntities).toBe(25);
        assertRoomEntities(roomA);
        assertRoomEntities(roomB);
    });
});


describe("test playerIds",function(){
    it("move entities",async function() {
        const roomA = new Room();
        const roomB = new Room();
        const AIds = new Set<number>();
        const BIds = new Set<number>();
        for(let i=0;i<100;i+=1){
            const e = new Entity();
            e.kind = EntityKind.Player;
            Room.AddEntity(roomA,e);
            if(i>=50){
                Room.MoveEntity(roomA,roomB,e);
                BIds.add(e.roomId);
            }else{
                AIds.add(e.roomId);
            }
        }
        expect(roomA.maxEntities).toBe(50);
        expect(roomB.maxEntities).toBe(50);
        assertRoomEntities(roomA);
        assertRoomEntities(roomB);
        //assert that the player IDS have been correctly updated from one room to the other
        expect(AIds.size).toBe(roomA.players.size);
        expect(BIds.size).toBe(roomB.players.size);
        for(const id of roomA.players){
            expect(AIds.has(id)).toBe(true);
        }
        for(const id of roomB.players){
            expect(BIds.has(id)).toBe(true);
        }
    });
    
});