import { PlayerConfig } from "./Config/PlayerConfig.mjs";
import { ResourceConfig } from "./Config/ResourceConfig.mjs";
import { Game } from "./Game.mjs";
class Main {
	static init (playerId:number,players:Array<PlayerConfig>,mission:ResourceConfig){	
		const canvas = document.getElementById("canvas") as HTMLCanvasElement;
		Game.gameInstance = new Game(canvas);
        Game.gameInstance.init(playerId,players,mission);
        console.log(Game.gameInstance);
        return Game.gameInstance;
	}
}
export {Main};