import { Material } from 'three';
import Stage from '../../Stage';
import { Vector3, Vector2 } from '../../Util';
import { BaseOptions } from '../Entity';
export { Box, createBox } from './Box';
export { Sphere, createSphere } from './Sphere';

export interface PrimitiveOptions extends BaseOptions {
	x?: number;
	y?: number;
	z?: number;
	position: Vector3;
	size?: Vector3;
	texturePath: string | null;
	textureSize: Vector2;
	color: number;
	material?: Material;
	isSensor?: boolean;
	fixed?: boolean;
}

export interface BoxOptions extends PrimitiveOptions {
	width: number;
	height: number;
	depth: number;
}

export interface SphereOptions extends PrimitiveOptions {
	radius: number;
}

type AnyOption = PrimitiveOptions | SphereOptions | BoxOptions;

export type CreatePrimitiveType = { classInstance: any, parameters: AnyOption, stage: Stage };