import { NetplayInput } from './netPeer/netplayInput.mjs';
declare abstract class InputReader {
    bindings: Map<string, number>;
    pressed(input: NetplayInput, key: number): boolean;
    released(input: NetplayInput, key: number): boolean;
    abstract getInput(): NetplayInput;
}
declare class KeyboardAndMouseInputReader extends InputReader {
    canvas: HTMLCanvasElement;
    mousePosition: {
        x: number;
        y: number;
    } | null;
    mouseDelta: {
        x: number;
        y: number;
    } | null;
    keyboardInput: NetplayInput;
    getCanvasScale(): {
        x: number;
        y: number;
    };
    projectClientPosition(clientX: number, clientY: number): {
        x: number;
        y: number;
    };
    constructor(canvas: HTMLCanvasElement);
    getInput(): NetplayInput;
}
export { KeyboardAndMouseInputReader };
