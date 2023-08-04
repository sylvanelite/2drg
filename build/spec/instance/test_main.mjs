import { Game } from "../../lib/Game.mjs";
describe("test main", function () {
    it("check prediction", async function () {
        const canvas = document.createElement("canvas");
        Game.gameInstance = new Game(canvas);
        const [playerId, playerCount] = [0, 1];
        Game.gameInstance.init(playerId, playerCount);
        console.log(Game.gameInstance);
    });
});
//# sourceMappingURL=test_main.mjs.map