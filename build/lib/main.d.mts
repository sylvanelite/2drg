import { PlayerConfig } from "./Config/PlayerConfig.mjs";
import { ResourceConfig } from "./Config/ResourceConfig.mjs";
import { Game } from "./Game.mjs";
declare class Main {
    static init(playerId: number, players: Array<PlayerConfig>, mission: ResourceConfig): Game;
}
export { Main };
