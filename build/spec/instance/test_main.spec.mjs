import { Game } from "../../lib/Game.mjs";
import { Room } from "../../lib/Room.mjs";
import { PlayerConfig } from "../../lib/Config/PlayerConfig.mjs";
import { ResourceConfig } from "../../lib/Config/ResourceConfig.mjs";
const canvasMock = {
    getContext: () => {
        return {};
    },
    addEventListener: () => { },
    parentElement: { addEventListener: () => { } }
};
describe("test main", function () {
    it("check creation", async function () {
        Game.gameInstance = new Game(canvasMock);
        expect(Game.gameInstance).not.toBeNull();
    });
    it("check init", async function () {
        Game.gameInstance = new Game(canvasMock);
        Game.gameInstance.worldSize = 2;
        const playerId = 0;
        const playerConfig = new PlayerConfig();
        const missionConfig = new ResourceConfig();
        Game.gameInstance.init(playerId, [playerConfig], missionConfig);
        expect(Game.gameInstance.rooms.length).toBe(Game.gameInstance.worldSize * Game.gameInstance.worldSize);
        expect(Game.gameInstance.playerUid).toBe(playerId);
    });
});
describe("test serialisation", function () {
    it("serialise/desertialise", async function () {
        Game.gameInstance = new Game(canvasMock);
        Game.gameInstance.worldSize = 2;
        const playerId = 0;
        const playerConfig = new PlayerConfig();
        const missionConfig = new ResourceConfig();
        Game.gameInstance.init(playerId, [playerConfig], missionConfig);
        const serial = Game.gameInstance.serialize();
        const entityCounts = Array(Game.gameInstance.rooms.length);
        const terrainSample = Array(Game.gameInstance.rooms.length);
        for (let i = 0; i < Game.gameInstance.rooms.length; i += 1) {
            entityCounts[i] = Game.gameInstance.rooms[i].maxEntities;
            terrainSample[i] = Game.gameInstance.rooms[i].terrain.terrain[64];
        }
        for (const room of Game.gameInstance.rooms) {
            for (let i = room.maxEntities - 1; i >= 0; i -= 1) {
                const ent = room.entities[i];
                Room.RemoveEntity(room, ent);
                room.terrain.terrain[64] = 0;
            }
        }
        for (let i = 0; i < Game.gameInstance.rooms.length; i += 1) {
            expect(Game.gameInstance.rooms[i].maxEntities).toBe(0);
            expect(Game.gameInstance.rooms[i].terrain.terrain[64]).toBe(0);
        }
        Game.gameInstance.deserialize(serial);
        for (let i = 0; i < Game.gameInstance.rooms.length; i += 1) {
            expect(Game.gameInstance.rooms[i].maxEntities).toBe(entityCounts[i]);
            expect(Game.gameInstance.rooms[i].terrain.terrain[64]).toBe(terrainSample[i]);
        }
    });
});
//# sourceMappingURL=test_main.spec.mjs.map