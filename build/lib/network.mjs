const GAME_ID = "SYESH_";
const _getId = () => {
    let result = '';
    const returnLength = 5;
    const characters = 'ABCDEFGHKMNPRSTUVWXYZ235689';
    const charactersLength = characters.length;
    for (let i = 0; i < returnLength; i += 1) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
class NW {
    GAME_ID = GAME_ID;
    networkId = "";
    hostId = "";
    get isHost() {
        if (!this.hostId) {
            return false;
        }
        return this.hostId == this.networkId;
    }
    connections = [];
    host() {
        this.networkId = _getId();
        this.hostId = this.networkId;
        this.connect();
    }
    join(hostId) {
        this.networkId = _getId();
        this.hostId = hostId;
        this.connect();
    }
    send(message) {
        for (const conn of this.connections) {
            conn.send(message);
        }
    }
}
export { NW };
//# sourceMappingURL=network.mjs.map