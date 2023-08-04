import { NW } from "./netPeer/network.mjs";
import { PlayerConfig } from "./Config/PlayerConfig.mjs";
import { ResourceConfig } from "./Config/ResourceConfig.mjs";
type JoinStatus = "ready" | "joined";
type MessageKind = "begin" | "telegraph" | "join" | "ready";
type Message = {
    data: any;
    id: string;
    kind: MessageKind;
};
interface IPlayerNum {
    peerid: string;
    telegraphPlayerNum: number;
    config: PlayerConfig;
}
declare class RbMain extends NW {
    #private;
    static messageCallback(message: string): void;
    connect(): void;
    joined: Map<string, JoinStatus>;
    playerConfig: Map<string, PlayerConfig>;
    constructor();
    onStart(players: Array<IPlayerNum>, playerId: number, mission: ResourceConfig): void;
    onData(rcvMessage: Message): Promise<void>;
    static begin(self: RbMain, config: PlayerConfig, mission: ResourceConfig): void;
    static readyUp(self: RbMain, config: PlayerConfig): void;
    static host: (self: RbMain) => string;
    static join(self: RbMain, hostId: string): void;
}
export { RbMain };
