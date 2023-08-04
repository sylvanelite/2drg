import { NetplayInput } from "./netplayInput.mjs";
import { CBuffer } from "./cbuffer.mjs";
class RollbackHistory {
    #frame;
    get frame() { return this.#frame; }
    #inputs;
    constructor(frame, inputs) {
        this.#frame = frame;
        this.#inputs = inputs;
    }
    static isPlayerInputPredicted(hist, player) {
        return hist.#inputs.get(player).isPrediction;
    }
    static allInputsSynced(hist) {
        for (const ipt of hist.#inputs.values()) {
            if (ipt.isPrediction)
                return false;
        }
        return true;
    }
    static setHistoryInput(hist, player, input) {
        hist.#inputs.set(player, input);
    }
    static getHistoryInputForPlayer(hist, player) {
        return hist.#inputs.get(player);
    }
    static copyHistInputs(hist) {
        const res = new Map();
        for (const player of hist.#inputs.keys()) {
            const existingInput = RollbackHistory.getHistoryInputForPlayer(hist, player);
            const inputUpdate = new NetplayInput();
            inputUpdate.deserialize(existingInput.serialize());
            inputUpdate.isPrediction = existingInput.isPrediction;
            res.set(player, inputUpdate);
        }
        return res;
    }
}
class RollbackNetcode {
    #future;
    #highestFrameReceived;
    #updateRecieved = false;
    #broadcastInput;
    #state;
    #confirmedState;
    #predictedFrame = 0;
    #confirmedInputs;
    #pollInput;
    #localPlayerId = 0;
    #history;
    #maxPredictedFrames;
    constructor(initialState, playerCount, localPlayerId, maxPredictedFrames, pollInput, broadcastInput) {
        this.#localPlayerId = localPlayerId;
        const historyInputs = new Map();
        this.#confirmedInputs = new Map();
        for (let i = 0; i < playerCount; i += 1) {
            historyInputs.set(i, new NetplayInput());
            this.#confirmedInputs.set(i, new NetplayInput());
        }
        this.#state = initialState;
        this.#confirmedState = this.#state.serialize();
        this.#maxPredictedFrames = maxPredictedFrames;
        this.#broadcastInput = broadcastInput;
        this.#pollInput = pollInput;
        this.#history = new CBuffer(maxPredictedFrames);
        this.#history.push(new RollbackHistory(0, historyInputs));
        this.#future = new Map();
        this.#highestFrameReceived = new Map();
        for (let i = 0; i < playerCount; i += 1) {
            this.#future.set(i, []);
            this.#highestFrameReceived.set(i, 0);
        }
    }
    onRemoteInput(frame, player, input) {
        this.#updateRecieved = true;
        const expectedFrame = this.#highestFrameReceived.get(player) + 1;
        this.#highestFrameReceived.set(player, expectedFrame);
        if (frame > this.#history.get(this.#history.length - 1).frame) {
            this.#future.get(player).push({ frame: frame, input: input });
            return;
        }
        for (let i = 0; i < this.#history.length; i += 1) {
            const h = this.#history.get(i);
            if (h.frame == frame) {
                RollbackHistory.setHistoryInput(h, player, input);
                break;
            }
        }
        for (let i = 1; i < this.#history.length; i += 1) {
            const h = this.#history.get(i);
            if (RollbackHistory.isPlayerInputPredicted(this.#history.get(i), player)) {
                const previousState = this.#history.get(i - 1);
                const previousPlayerInput = RollbackHistory.getHistoryInputForPlayer(previousState, player);
                RollbackHistory.setHistoryInput(h, player, previousPlayerInput.predictNext());
            }
        }
    }
    updateSimulations() {
        if (!this.#updateRecieved) {
            return;
        }
        this.#updateRecieved = false;
        this.#state.deserialize(this.#confirmedState);
        for (let i = 0; i < this.#history.length; i += 1) {
            const h = this.#history.get(i);
            const currentStateInputs = RollbackHistory.copyHistInputs(h);
            this.#state.tick(currentStateInputs);
            if (RollbackHistory.allInputsSynced(h)) {
                this.#confirmedState = this.#state.serialize();
            }
        }
        while (this.#history.length > 0) {
            const h = this.#history.get(0);
            if (!RollbackHistory.allInputsSynced(h)) {
                break;
            }
            this.#history.shift();
            this.#confirmedInputs = RollbackHistory.copyHistInputs(h);
        }
    }
    #shouldStall() {
        let predictedFrames = 0;
        for (let i = 0; i < this.#history.length; i += 1) {
            if (!RollbackHistory.allInputsSynced(this.#history.get(i))) {
                predictedFrames = this.#history.length - i;
                break;
            }
        }
        return predictedFrames >= this.#maxPredictedFrames - 1;
    }
    tick() {
        if (this.#shouldStall()) {
            return;
        }
        this.#predictedFrame += 1;
        const newInputs = new Map();
        for (const [player, lastConfirmedInput] of this.#confirmedInputs.entries()) {
            if (player == this.#localPlayerId) {
                const localInput = this.#pollInput();
                newInputs.set(player, localInput);
                this.#broadcastInput(this.#predictedFrame, localInput);
                continue;
            }
            if (this.#future.get(player).length > 0) {
                const future = this.#future.get(player).shift();
                newInputs.set(player, future.input);
                continue;
            }
            newInputs.set(player, lastConfirmedInput.predictNext());
        }
        this.#state.tick(newInputs);
        this.#history.push(new RollbackHistory(this.#predictedFrame, newInputs));
    }
    _updateInterval(timeElapsed) {
        this.#updateDelta += timeElapsed;
        if (this.#updateDelta > 50 || this.#history.length > this.#maxPredictedFrames - 2) {
            this.updateSimulations();
            this.#updateDelta = 0;
        }
        let numTicks = 1;
        const largestFutureSize = Math.max(...Array.from(this.#future.values()).map((a) => a.length));
        if (largestFutureSize > 0) {
            numTicks = 2;
        }
        for (let i = 0; i < numTicks; i += 1) {
            this.tick();
        }
    }
    #updateDelta = 0;
    start(timestep) {
        let lastUpdate = performance.now();
        setInterval(() => {
            const timeElapsed = performance.now() - lastUpdate;
            lastUpdate = performance.now();
            this._updateInterval(timeElapsed);
        }, timestep);
    }
}
export { RollbackNetcode };
//# sourceMappingURL=rollback.mjs.map