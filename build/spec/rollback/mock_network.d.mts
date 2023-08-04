import { RollbackNetcode } from "../../lib/netPeer/rollback.mjs";
import { NetplayInput } from "../../lib/netPeer/netplayInput.mjs";
import { NW } from "../../lib/netPeer/network.mjs";
interface IPlayerNum {
    peerid: string;
    telegraphPlayerNum: number;
}
declare const waitForMessageQueue: () => Promise<void>;
declare class GameTestInstance {
    internalState: {
        player0: number;
        player1: number;
        player2: number;
    };
    constructor();
    tick(playerInputs: Map<number, NetplayInput>): void;
    serialize(): string;
    deserialize(value: string): void;
}
declare const BUFFER_LIMIT = 10;
declare class RollbackTestWrapper extends NW {
    #private;
    connect(): void;
    localinput: NetplayInput;
    pollinput(): NetplayInput;
    onRollbackData(message: any): Promise<void>;
    rollbackNetcode: RollbackNetcode;
    constructor(pollinput?: Function);
    game: GameTestInstance;
    onStart(game: GameTestInstance, allPlayers: Array<IPlayerNum>, playerId: number): void;
}
declare const cleanup: () => Promise<void>;
declare const KEY_A = 1;
export { KEY_A, BUFFER_LIMIT, cleanup, RollbackTestWrapper, GameTestInstance, waitForMessageQueue };
