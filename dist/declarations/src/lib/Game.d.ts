import { PyramidStage } from './Stage';
import { ControllerInput } from './Gamepad';
import Globals from './Globals';
export interface LoopInterface {
    ticks: number;
    inputs: ControllerInput[];
    stage: PyramidStage;
    globals: Globals;
}
export interface SetupInterface {
    commands: {
        create: Function;
    };
    globals: Globals;
}
declare function Game({ app, stages }: {
    app: HTMLElement | string;
    stages?: Function[];
}): (target: any) => void;
export default Game;
