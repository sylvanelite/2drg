import { NetplayInput, NetplayState } from "./netplayInput.mjs";
type NetplayPlayer = number;
declare class RollbackNetcode {
    #private;
    constructor(initialState: NetplayState, playerCount: number, localPlayerId: number, maxPredictedFrames: number, pollInput: () => NetplayInput, broadcastInput: (frame: number, input: NetplayInput) => void);
    onRemoteInput(frame: number, player: NetplayPlayer, input: NetplayInput): void;
    updateSimulations(): void;
    tick(): void;
    _updateInterval(timeElapsed: number): void;
    start(timestep: number): void;
}
export { RollbackNetcode };
