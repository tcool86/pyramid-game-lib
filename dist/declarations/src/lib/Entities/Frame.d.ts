import Entity from "./Entity";
export declare class Frame {
    internalTimer: number;
    reset: number;
    callback: Function;
    constructor(callback: Function, internalTimer: number, delta: number);
    update(delta: number): void;
}
export declare const frameMaker: (delta: number, self: Entity) => (timer: number, callback: Function) => void;
