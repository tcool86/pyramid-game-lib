import Entity from '../Entity';
import { BoxOptions, CreatePrimitiveType } from ".";
export declare function Box(options: Partial<BoxOptions>): (target: any) => void;
export declare function createBox({ classInstance, parameters, stage }: CreatePrimitiveType): Entity;
