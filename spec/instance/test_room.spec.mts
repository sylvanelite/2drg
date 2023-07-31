import { Room } from "../../lib/Room.mjs";
import { Entity } from "../../lib/Entity.mjs";


describe("test room",function(){
	it("add entities",async function() {
        const room = new Room();
        for(let i=0;i<100;i+=1){
            Room.AddEntity(room,new Entity());
        }
        expect(room.maxEntities).toBe(100);
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
    });
});

