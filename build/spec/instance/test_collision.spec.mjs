import { Room } from "../../lib/Room.mjs";
import { Entity, Collision } from "../../lib/Entity.mjs";
describe("test collision", function () {
    it("test collision found x", async function () {
        const room = new Room();
        const entityA = new Entity();
        const entityB = new Entity();
        const entityC = new Entity();
        entityA.size.x = 8;
        entityA.size.y = 8;
        entityB.size.x = 8;
        entityB.size.y = 8;
        entityC.size.x = 8;
        entityC.size.y = 8;
        entityA.position.x = 0;
        entityB.position.x = 6;
        entityC.position.x = 13;
        entityA.position.y = 0;
        entityB.position.y = 6;
        entityC.position.y = 0;
        Room.AddEntity(room, entityA);
        Room.AddEntity(room, entityB);
        Room.AddEntity(room, entityC);
        Collision.preExecute();
        Collision.populateCollisions(room);
        let CollideA = 0;
        let CollideB = 0;
        let CollideC = 0;
        Collision.checkCollisions(room, entityA, (collisionId) => {
            const ent = room.entities[collisionId];
            expect(ent.uid).not.toBe(entityC.uid);
            expect(ent.uid).not.toBe(entityA.uid);
            CollideA += 1;
        });
        Collision.checkCollisions(room, entityB, (collisionId) => {
            const ent = room.entities[collisionId];
            expect(ent.uid).not.toBe(entityB.uid);
            CollideB += 1;
        });
        Collision.checkCollisions(room, entityC, (collisionId) => {
            const ent = room.entities[collisionId];
            expect(ent.uid).not.toBe(entityA.uid);
            expect(ent.uid).not.toBe(entityC.uid);
            CollideC += 1;
        });
        expect(CollideA).toBe(1);
        expect(CollideB).toBe(2);
        expect(CollideC).toBe(1);
    });
    it("test collision found y", async function () {
        const room = new Room();
        const entityA = new Entity();
        const entityB = new Entity();
        const entityC = new Entity();
        entityA.size.x = 8;
        entityA.size.y = 8;
        entityB.size.x = 8;
        entityB.size.y = 8;
        entityC.size.x = 8;
        entityC.size.y = 8;
        entityA.position.y = 0;
        entityB.position.y = 6;
        entityC.position.y = 13;
        entityA.position.x = 0;
        entityB.position.x = 6;
        entityC.position.x = 0;
        Room.AddEntity(room, entityA);
        Room.AddEntity(room, entityB);
        Room.AddEntity(room, entityC);
        Collision.preExecute();
        Collision.populateCollisions(room);
        let CollideA = 0;
        let CollideB = 0;
        let CollideC = 0;
        Collision.checkCollisions(room, entityA, (collisionId) => {
            const ent = room.entities[collisionId];
            expect(ent.uid).not.toBe(entityC.uid);
            expect(ent.uid).not.toBe(entityA.uid);
            CollideA += 1;
        });
        Collision.checkCollisions(room, entityB, (collisionId) => {
            const ent = room.entities[collisionId];
            expect(ent.uid).not.toBe(entityB.uid);
            CollideB += 1;
        });
        Collision.checkCollisions(room, entityC, (collisionId) => {
            const ent = room.entities[collisionId];
            expect(ent.uid).not.toBe(entityA.uid);
            expect(ent.uid).not.toBe(entityC.uid);
            CollideC += 1;
        });
        expect(CollideA).toBe(1);
        expect(CollideB).toBe(2);
        expect(CollideC).toBe(1);
    });
    it("test collision large objects", async function () {
        const room = new Room();
        const entityA = new Entity();
        const entityB = new Entity();
        const entityC = new Entity();
        entityA.size.x = 80;
        entityA.size.y = 80;
        entityB.size.x = 80;
        entityB.size.y = 80;
        entityC.size.x = 80;
        entityC.size.y = 80;
        entityA.position.x = 0;
        entityB.position.x = 60;
        entityC.position.x = 130;
        entityA.position.y = 0;
        entityB.position.y = 60;
        entityC.position.y = 0;
        Room.AddEntity(room, entityA);
        Room.AddEntity(room, entityB);
        Room.AddEntity(room, entityC);
        Collision.preExecute();
        Collision.populateCollisions(room);
        let CollideA = 0;
        let CollideB = 0;
        let CollideC = 0;
        Collision.checkCollisions(room, entityA, (collisionId) => {
            const ent = room.entities[collisionId];
            expect(ent.uid).not.toBe(entityC.uid);
            expect(ent.uid).not.toBe(entityA.uid);
            CollideA += 1;
        });
        Collision.checkCollisions(room, entityB, (collisionId) => {
            const ent = room.entities[collisionId];
            expect(ent.uid).not.toBe(entityB.uid);
            CollideB += 1;
        });
        Collision.checkCollisions(room, entityC, (collisionId) => {
            const ent = room.entities[collisionId];
            expect(ent.uid).not.toBe(entityA.uid);
            expect(ent.uid).not.toBe(entityC.uid);
            CollideC += 1;
        });
        expect(CollideA).toBe(1);
        expect(CollideB).toBe(2);
        expect(CollideC).toBe(1);
    });
});
//# sourceMappingURL=test_collision.spec.mjs.map