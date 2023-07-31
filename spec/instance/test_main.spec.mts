import { Game } from "../../lib/Game.mjs";

const canvasMock = {
    getContext:()=>{
        return {};
    },
    addEventListener:()=>{},
    parentElement:{addEventListener:()=>{}}
};
describe("test main",function(){
	it("check prediction",async function() {
        Game.gameInstance = new Game(canvasMock as any);
        expect(Game.gameInstance).not.toBeNull();
        expect(Game.gameInstance.rooms.length).toBe(Game.gameInstance.worldSize*Game.gameInstance.worldSize);
    });
});

//TODO: init is slow, get better perf
describe("test main init",function(){
	it("check prediction",async function() {
        Game.gameInstance = new Game(canvasMock as any);
        const [playerId,playerCount] = [0,1];
        Game.gameInstance.init(playerId,playerCount);
        expect(Game.gameInstance.playerUid).toBe(playerId);
    });
});

