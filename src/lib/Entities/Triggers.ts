import * as THREE from 'three';
import Stage from '../Stage';
import { Vector3 } from '../Util';
import Entity, { BaseOptions } from './Entity';

/**
 * Functions for creating primitive geometries easily
 * easily create an object with collision and a texture
 * 
 */

export interface TriggerEntity extends Entity {
	action?: Function;
	exitAction?: Function;
	enteredTrigger?: boolean;
}

export interface TriggerOptions extends BaseOptions {
	width?: number;
	height?: number;
	depth?: number;
	position?: Vector3;
	x?: number;
	y?: number;
	z?: number;
	action: Function;
	exitAction: Function;
}

export function createAreaTrigger(options: TriggerOptions, stage: Stage) {
	const { width, height, depth } = options;
	const position = options?.position || new Vector3(0, 0, 0);
	const entity: TriggerEntity = new Entity(stage, 'test');
	const size = new Vector3(width, height, depth);
	const color = options?.debugColor || 0xFFFFFF;
	const geometry = new THREE.BoxGeometry(width, height, depth);
	entity.createDebugMesh(geometry, position, color);
	entity.createBody(position);
	entity.collisionRectangular(size, true);
	entity.collisionStatic();
	entity.showDebug = options?.showDebug ?? false;
	entity.action = options.action;
	entity.exitAction = options.exitAction;
	stage.children.set(entity.id, entity);
	stage.triggers.set(entity.id, entity);
	return entity;
}

export function Triggers(stage: Stage) {
	return {
		createAreaTrigger: (options: TriggerOptions) => {
			return createAreaTrigger(options, stage)
		},
	}
}