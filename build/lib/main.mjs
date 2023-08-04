import { Game } from "./Game.mjs";
class Main {
    static init(playerId, players, mission) {
        const canvas = document.getElementById("canvas");
        Game.gameInstance = new Game(canvas);
        Game.gameInstance.init(playerId, players, mission);
        console.log(Game.gameInstance);
        return Game.gameInstance;
    }
}
export { Main };
//# sourceMappingURL=main.mjs.map