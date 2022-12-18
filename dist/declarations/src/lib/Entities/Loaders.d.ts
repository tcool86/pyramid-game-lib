import Stage from '../Stage';
import { PyramidActor, ActorOptions } from './Actor';
export declare function createActor(target: any, stage: Stage): Promise<PyramidActor>;
export declare function Loaders(stage: Stage): {
    createActor: (options: ActorOptions) => Promise<PyramidActor>;
};
