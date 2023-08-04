import { RollbackNetcode } from "../../lib/netPeer/rollback.mjs";
import { NetplayInput } from "../../lib/netPeer/netplayInput.mjs";
import { NW } from "../../lib/netPeer/network.mjs";
let messageQueue = [];
const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(() => {
        resolve();
    }, ms));
};
const networkDelay = async (callback) => {
    const pause = sleep(1);
    messageQueue.push(pause);
    await pause;
    messageQueue = [];
    callback();
};
const peers = new Map();
class MockConnection {
    idToSendTo = "";
    constructor(idToSendTo) {
        this.idToSendTo = idToSendTo;
    }
    send = (msg) => {
        networkDelay(() => {
            const target = peers.get(this.idToSendTo);
            target.onRollbackData(msg);
        });
    };
}
const waitForMessageQueue = async () => {
    while (messageQueue.length) {
        await Promise.all(messageQueue);
    }
};
class GameTestInstance {
    internalState = {
        player0: 100,
        player1: 200,
        player2: 300
    };
    constructor() { }
    tick(playerInputs) {
        for (const [p, ipt] of playerInputs) {
            if (p == 0) {
                if (NetplayInput.getPressed(ipt, KEY_A)) {
                    this.internalState.player0 += 1;
                }
            }
            if (p == 1) {
                if (NetplayInput.getPressed(ipt, KEY_A)) {
                    this.internalState.player1 += 1;
                }
            }
            if (p == 2) {
                if (NetplayInput.getPressed(ipt, KEY_A)) {
                    this.internalState.player2 += 1;
                }
            }
        }
    }
    serialize() { return JSON.stringify(this.internalState); }
    deserialize(value) { this.internalState = JSON.parse(value); }
}
const BUFFER_LIMIT = 10;
class RollbackTestWrapper extends NW {
    connect() {
        peers.set(this.networkId, this);
        if (!this.isHost) {
            this.connections.push(new MockConnection(this.hostId));
            const host = peers.get(this.hostId);
            host.connections.push(new MockConnection(this.networkId));
        }
    }
    #send(message) {
        message.peerid = this.networkId;
        this.send({
            kind: "telegraph",
            data: message
        });
    }
    localinput = new NetplayInput();
    pollinput() {
        return this.localinput;
    }
    async onRollbackData(message) {
        const data = message.data;
        if (data.peerid == this.networkId) {
            return;
        }
        if (this.isHost) {
            this.send({
                kind: "telegraph",
                data
            });
        }
        if (data.type === "input") {
            let input = new NetplayInput();
            input.deserialize(data.input);
            this.rollbackNetcode.onRemoteInput(data.frame, data.handle, input);
        }
    }
    rollbackNetcode;
    constructor(pollinput) {
        super();
        if (pollinput) {
            this.pollinput = pollinput;
        }
    }
    game;
    onStart(game, allPlayers, playerId) {
        this.game = game;
        this.rollbackNetcode = new RollbackNetcode(game, allPlayers.length, playerId, BUFFER_LIMIT, () => this.pollinput(), (frame, input) => {
            this.#send({ type: "input", frame: frame, input: input.serialize(), handle: playerId });
        });
    }
}
const cleanup = async () => {
    await waitForMessageQueue();
    peers.clear();
    messageQueue.splice(0);
};
const KEY_A = 1;
export { KEY_A, BUFFER_LIMIT, cleanup, RollbackTestWrapper, GameTestInstance, waitForMessageQueue };
//# sourceMappingURL=mock_network.mjs.map