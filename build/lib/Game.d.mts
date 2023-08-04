import { KeyboardAndMouseInputReader } from "./inputController.mjs";
import { NetplayInput, NetplayState } from "./netPeer/netplayInput.mjs";
import { Room } from "./Room.mjs";
import { PlayerConfig, PlayerLiveCount } from "./Config/PlayerConfig.mjs";
import { ResourceConfig, ResourceLiveCount } from "./Config/ResourceConfig.mjs";
declare class Game extends NetplayState {
    static gameInstance: Game;
    serialize(): any;
    deserialize(value: any): void;
    inputReader: KeyboardAndMouseInputReader;
    ctx: CanvasRenderingContext2D;
    rooms: Array<Room>;
    currentRoom: number;
    worldSize: number;
    playerUid: number;
    tickRate: number;
    playerConfig: Map<number, PlayerConfig>;
    missionConfig: ResourceConfig;
    resourceLiveCount: ResourceLiveCount;
    playerLiveCount: Map<number, PlayerLiveCount>;
    constructor(canvas: HTMLCanvasElement);
    init(playerId: number, players: Array<PlayerConfig>, mission: ResourceConfig): void;
    static inputs: Map<number, NetplayInput>;
    tick(playerInputs: Map<number, NetplayInput>): void;
    draw(): void;
}
export { Game };
