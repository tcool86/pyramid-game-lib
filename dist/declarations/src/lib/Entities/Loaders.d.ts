import Stage from '../Stage';
import { Vector3 } from '../Util';
import { BaseOptions } from './Entity';
import Actor from './Actor';
export interface ActorOptions extends BaseOptions {
    files: Array<string>;
    position?: Vector3;
}
export declare function createActor(options: ActorOptions, stage: Stage): Promise<Actor>;
export declare function Loaders(stage: Stage): {
    createActor: (options: ActorOptions) => Promise<Actor>;
};
