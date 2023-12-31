import { Main } from "./main.mjs";
import { Game } from "./Game.mjs";
import { PlayerConfig } from "./Config/PlayerConfig.mjs";
import { ResourceConfig } from "./Config/ResourceConfig.mjs";

class LocalMain{
    static #inputs = new Map();
    static #mainLoop(){
        const inputs = LocalMain.#game.inputReader.getInput();
        LocalMain.#inputs.clear();
        LocalMain.#inputs.set(0,inputs);//Player id:0
        LocalMain.#game.tick(LocalMain.#inputs);
    }
    static #renderLoop(){
        LocalMain.#game.draw();
        requestAnimationFrame(LocalMain.#renderLoop);

    }
    static #game:Game;
    constructor(){ }
    //TOOD: instead of having this as its own class
    //should we modify RB to accept a non-network instance?
    begin(){
        const playerConfig = new PlayerConfig();
        playerConfig.chosenClass = PlayerConfig.CLASSES.DRILLER;
        const missionConfig = new ResourceConfig();
        missionConfig.chosenSecondary = ResourceConfig.SECONDARY_OBJECTIVE.FOSSIL;
        missionConfig.seed = Math.floor(Math.random()*10000);
        const missionKinds = [
            ResourceConfig.PRIMARY_OBJECTIVE.MINING_EXPEDITION,
            ResourceConfig.PRIMARY_OBJECTIVE.EGG_HUNT,
            ResourceConfig.PRIMARY_OBJECTIVE.POINT_EXTRACTION];
        missionConfig.chosenPrimary = missionKinds[Math.floor(Math.random()*missionKinds.length)];
        LocalMain.#game = Main.init(0,[playerConfig],missionConfig);
        setInterval(LocalMain.#mainLoop, LocalMain.#game.tickRate);
        requestAnimationFrame(LocalMain.#renderLoop);
    };

}

export {LocalMain};

