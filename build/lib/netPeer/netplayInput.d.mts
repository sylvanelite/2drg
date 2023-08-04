declare abstract class NetplayState {
    abstract tick(playerInputs: Map<number, NetplayInput>): void;
    abstract serialize(): string;
    abstract deserialize(value: string): void;
}
declare class NetplayInput {
    isPrediction: boolean;
    predictNext(): NetplayInput;
    serialize(): string;
    deserialize(jsonStr: string): void;
    static setPressed(ipt: NetplayInput, key: number): void;
    static setReleased(ipt: NetplayInput, key: number): void;
    static clearPressed(ipt: NetplayInput, key: number): void;
    static clearReleased(ipt: NetplayInput, key: number): void;
    static getPressed(ipt: NetplayInput, key: number): boolean;
    static getReleased(ipt: NetplayInput, key: number): boolean;
    keysPressed: number;
    keysReleased: number;
    mousePosition?: {
        x: number;
        y: number;
    };
}
export { NetplayState, NetplayInput };
