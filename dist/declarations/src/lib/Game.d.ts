import Stage from './Stage';
import { ControllerInput } from './Gamepad';
import Globals from './Globals';
export interface LoopInterface {
    ticks: number;
    inputs: ControllerInput[];
    stage: Stage;
    globals: Globals;
}
export interface SetupInterface {
    commands: {
        create: Function;
    };
    globals: Globals;
}
declare function Game({ app }: {
    app: HTMLElement | string;
}): (target: any) => void;
export default Game;
