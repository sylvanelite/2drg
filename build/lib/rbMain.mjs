import { NW } from "./netPeer/network.mjs";
import { NetplayInput } from "./netPeer/netplayInput.mjs";
import { RollbackNetcode } from "./netPeer/rollback.mjs";
import { Peer } from "./peer/peerjs.mjs";
import { Main } from "./main.mjs";
import { ResourceConfig } from "./Config/ResourceConfig.mjs";
class RbMain extends NW {
    static messageCallback(message) { }
    connect() {
        const peer = new Peer(this.GAME_ID + this.networkId);
        peer.on('connection', (conn) => {
            this.connections.push(conn);
            conn.on('data', (data) => {
                this.onData(data);
            });
        });
        peer.on('open', (e) => {
            if (!this.isHost) {
                const conn = peer.connect(this.GAME_ID + this.hostId, { reliable: true });
                conn.on('open', () => {
                    this.connections.push(conn);
                    for (const conn of this.connections) {
                        conn.send({ kind: 'join', id: this.networkId });
                    }
                });
                conn.on('data', (data) => {
                    this.onData(data);
                });
            }
        });
    }
    joined = new Map();
    playerConfig = new Map();
    #rollbackNetcode;
    constructor() {
        super();
    }
    onStart(players, playerId, mission) {
        const playerCount = players.length;
        const configs = [];
        for (const p of players) {
            configs.push(p.config);
        }
        const game = Main.init(playerId, configs, mission);
        this.#rollbackNetcode = new RollbackNetcode(game, playerCount, playerId, 10, () => game.inputReader.getInput(), (frame, input) => {
            this.send({
                kind: 'telegraph',
                data: { type: "input", frame, input: input.serialize(), handle: playerId,
                    peerid: this.networkId }
            });
        });
        console.log("Successfully connected to server.. Starting game..");
        this.#rollbackNetcode.start(game.tickRate);
        const animate = () => {
            game.draw();
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }
    async onData(rcvMessage) {
        if (this.isHost) {
            if (rcvMessage.kind == 'join') {
                RbMain.messageCallback("JOIN: " + rcvMessage.id);
                this.joined.set(rcvMessage.id, "joined");
            }
            if (rcvMessage.kind == 'ready') {
                RbMain.messageCallback("READY: " + rcvMessage.id);
                this.joined.set(rcvMessage.id, "ready");
                this.playerConfig.set(rcvMessage.id, rcvMessage.data.config);
            }
            if (rcvMessage.kind == "telegraph") {
                this.send(rcvMessage);
            }
        }
        if (!this.isHost) {
            if (rcvMessage.kind == 'begin') {
                const players = rcvMessage.data.allPlayers;
                let myId = 1;
                for (let i = 0; i < players.length; i += 1) {
                    if (players[i].peerid == this.networkId) {
                        myId = i;
                        break;
                    }
                }
                this.onStart(players, myId, rcvMessage.data.mission);
            }
        }
        if (rcvMessage.kind == "telegraph" && rcvMessage.data.peerid != this.networkId) {
            const data = rcvMessage.data;
            if (data.type === "input") {
                let input = new NetplayInput();
                input.deserialize(data.input);
                this.#rollbackNetcode.onRemoteInput(data.frame, data.handle, input);
            }
        }
    }
    static begin(self, config, mission) {
        if (self.joined.size < 1) {
            RbMain.messageCallback("not enough remove players");
            console.log("not enough remote players", self.joined);
            return;
        }
        for (const [id, status] of self.joined) {
            if (self.joined.get(id) != "ready") {
                RbMain.messageCallback("player not ready:" + id);
                console.log("player not ready", id, self.joined);
                return;
            }
        }
        const numPlayers = self.joined.size + 1;
        const allPlayers = [{
                peerid: self.networkId,
                telegraphPlayerNum: 0,
                config
            }];
        let playerNum = 1;
        for (const [id, status] of self.joined) {
            allPlayers.push({
                peerid: id,
                telegraphPlayerNum: playerNum,
                config: self.playerConfig.get(id)
            });
            playerNum += 1;
        }
        if (!mission) {
            mission = new ResourceConfig();
        }
        const msg = { allPlayers, numPlayers, mission };
        self.send({
            kind: 'begin', data: msg
        });
        self.onStart(allPlayers, 0, mission);
    }
    static readyUp(self, config) {
        if (!self.isHost) {
            self.send({
                kind: 'ready', id: self.networkId,
                data: { config }
            });
        }
    }
    static host = (self) => {
        self.host();
        console.log(self.networkId);
        return self.networkId;
    };
    static join(self, hostId) {
        self.join(hostId);
        console.log(self.networkId);
    }
}
export { RbMain };
//# sourceMappingURL=rbMain.mjs.map