import { PrimitiveOptions } from "./Entities/Primitives";
import Stage from './Stage';
import { TriggerOptions } from "./Entities/Triggers";
import { BaseOptions } from "./Entities/Entity";
declare type AnyOptions = BaseOptions & PrimitiveOptions & TriggerOptions;
export declare function create(options: AnyOptions, stage: Stage): import("./Entities").Entity;
export declare function Create(stage: Stage): {
    create: (options: AnyOptions) => import("./Entities").Entity;
};
export {};
