export { default as Actor } from "./Actor";
export { default as Entity } from "./Entity";
export { default as Collision } from "./Collision";
export { Box, Sphere } from "./Primitives";
export { Trigger } from "./Triggers";
import { PrimitiveOptions } from "./Primitives";
import Stage from '../Stage';
export declare type AnyOption = any | PrimitiveOptions;
export declare type CreationParameters = {
    classInstance: any;
    parameters: AnyOption;
    stage: Stage;
};
export interface BaseOptions {
    showDebug: boolean;
    debugColor: number;
    collisionKey?: string;
}
