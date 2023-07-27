import { Game } from "./Game.mjs";
class Main {
	static init (playerId:number,playerCount:number){	
		const canvas = document.getElementById("canvas") as HTMLCanvasElement;
		Game.gameInstance = new Game(canvas);
        Game.gameInstance.init(playerId,playerCount);
        console.log(Game.gameInstance);
        return Game.gameInstance;
	}
}
export {Main};