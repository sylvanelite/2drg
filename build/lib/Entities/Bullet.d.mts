import { Entity } from "../Entity.mjs";
import { Room } from "../Room.mjs";
declare class Bullet {
    static update(room: Room, entity: Entity): void;
    static destroyBullet(room: Room, entity: Entity): void;
    static draw(ctx: CanvasRenderingContext2D, entity: Entity): void;
}
export { Bullet };
