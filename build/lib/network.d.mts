interface IPeer {
    create: (id: string) => string;
    onData: (msg: any) => void;
    connections: Array<IConnection>;
}
interface IConnection {
    send: (msg: object) => void;
}
declare abstract class NW {
    GAME_ID: string;
    networkId: string;
    hostId: string;
    get isHost(): boolean;
    connections: Array<IConnection>;
    host(): void;
    join(hostId: string): void;
    send(message: object): void;
    abstract connect(): void;
}
export { NW, IPeer, IConnection };
