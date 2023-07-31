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
        const [playerId,playerCount] = [0,1];
       // Game.gameInstance.init(playerId,playerCount);
        console.log(Game.gameInstance);
    });
});