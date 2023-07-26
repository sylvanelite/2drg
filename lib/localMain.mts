import {Main} from "./main.mjs";

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
    static #game:any;
    constructor(){ }
    //TOOD: instead of having this as its own class
    //should we modify RB to accept a non-network instance?
    begin(){
        LocalMain.#game = Main.init(0,1);
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        setInterval(LocalMain.#mainLoop, LocalMain.#game.tickRate*1000);
        requestAnimationFrame(LocalMain.#renderLoop);
    };

}

export {LocalMain};

