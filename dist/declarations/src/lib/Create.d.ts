import { PrimitiveOptions } from "./Entities/Primitives";
import Stage from './Stage';
export declare function create(options: PrimitiveOptions, stage: Stage): import("./Entities").Entity;
export declare function Create(stage: Stage): {
    create: (options: PrimitiveOptions) => import("./Entities").Entity;
};
