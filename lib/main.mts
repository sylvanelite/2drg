import { PlayerConfig } from "./Entities/PlayerConfig.mjs";
import { Game } from "./Game.mjs";
class Main {
	static init (playerId:number,players:Array<PlayerConfig>){	
		const canvas = document.getElementById("canvas") as HTMLCanvasElement;
		Game.gameInstance = new Game(canvas);
        Game.gameInstance.init(playerId,players);
        console.log(Game.gameInstance);
        return Game.gameInstance;
	}
}
export {Main};