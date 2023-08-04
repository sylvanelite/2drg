import { EntityKind, EuqippedKind } from './types.mjs';
import { Room } from './Room.mjs';
declare class Entity {
    static uid: number;
    uid: number;
    roomId: number;
    kind: EntityKind;
    euqipped: EuqippedKind;
    hp: number;
    maxHp: number;
    cooldown: number;
    secondaryCooldown: number;
    sprite: number;
    spriteFrame: number;
    position: {
        x: number;
        y: number;
    };
    velocity: {
        x: number;
        y: number;
    };
    size: {
        x: number;
        y: number;
    };
    constructor();
    static update(room: Room, entity: Entity): void;
    static draw(ctx: CanvasRenderingContext2D, entity: Entity): void;
}
declare class Collision {
    static cellSize: number;
    static preExecute(): void;
    static populateCollisions(room: Room): void;
    static touches(entity: Entity, other: Entity): boolean;
    static checkCollisions(room: Room, entity: Entity, collideCallback: Function): void;
}
export { Entity, Collision };
