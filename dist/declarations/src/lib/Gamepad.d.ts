export declare type GamepadConnections = Map<number, boolean>;
export interface ControllerInput {
    horizontal: number;
    vertical: number;
    buttonA: number;
    buttonB: number;
    buttonX: number;
    buttonY: number;
    select: number;
    start: number;
}
export default class Gamepad {
    hasSupport: boolean;
    lastConnection: number;
    connections: GamepadConnections;
    keyboardInput: Map<string, boolean>;
    constructor();
    scanGamepads(): void;
    getInputAtIndex(index: number): ControllerInput;
    getInputs(): ControllerInput[];
}
