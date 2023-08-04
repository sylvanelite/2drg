import { Entity } from "../Entity.mjs";
import { Room } from "../Room.mjs";
declare class Conductor {
    static TiggerWave(room: Room, waveKind: number): void;
    static update(room: Room, entity: Entity): void;
}
export { Conductor };
