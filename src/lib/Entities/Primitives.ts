import * as THREE from 'three';
import Stage from '../Stage';
import { Vector3, Vector2 } from '../Util';
import Entity, { BaseOptions } from './Entity';

/**
 * Functions for creating primitive geometries easily
 * easily create an object with collision and a texture
 * 
 */

export interface PrimitiveOptions extends BaseOptions {
	material?: THREE.Material;
	texturePath?: string;
	textureSize?: Vector2; // TODO: this could be automated
	color?: number;
	width?: number;
	height?: number;
	depth?: number;
	size?: Vector3;
	radius?: number;
	position?: Vector3;
	x?: number;
	y?: number;
	z?: number;
	fixed?: boolean;
}

export function createBox(options: PrimitiveOptions, stage: Stage) {
	const { width, height, depth } = options;
	const position = options?.position || new Vector3(0, 0, 0);
	const entity = new Entity(stage, 'test');
	const size = new Vector3(width, height, depth);
	const color = options?.color || 0xFFFFFF;
	const texturePath = options?.texturePath || null;
	const textureSize = options?.textureSize || new Vector2(1, 1);
	entity.applyMaterial(texturePath, color, textureSize);
	entity.rectangularMesh(size, position);
	entity.createBody(position);
	entity.collisionRectangular(size);
	entity.body.setAdditionalMass(0.02, true);
	entity.body.setAngularDamping(0.1);
	if (options?.fixed) {
		entity.collisionStatic();
	}
	entity.debugColor = options?.debugColor ?? 0xffffff;
	entity.showDebug = options?.showDebug ?? false;
	stage.children.set(entity.id, entity);
	return entity;
}

export function createSphere(options: PrimitiveOptions, stage: Stage) {
	const radius = options.radius ?? 1;
	const position = options?.position || new Vector3(0, 0, 0);
	const entity = new Entity(stage, 'test');
	const color = options?.color || 0xFFFFFF;
	const texturePath = options?.texturePath || null;
	const textureSize = options?.textureSize || new Vector2(1, 1);
	entity.applyMaterial(texturePath, color, textureSize);
	entity.sphericalMesh(radius, position);
	entity.createBody(position);
	entity.collisionSpherical(radius);
	entity.body.setAdditionalMass(0.02, true);
	entity.body.setAngularDamping(0.1);
	entity.debugColor = options?.debugColor ?? 0xffffff;
	entity.showDebug = options?.showDebug ?? false;
	stage.children.set(entity.id, entity);
	return entity;
}

export function Primitives(stage: Stage) {
	return {
		createBox: (options: PrimitiveOptions) => {
			return createBox(options, stage)
		},
		createSphere: (options: PrimitiveOptions) => {
			return createSphere(options, stage);
		}
	}
}