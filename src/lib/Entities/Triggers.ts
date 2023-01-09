import * as THREE from 'three';
import { Vector3 } from '../Util';
import { CreationParameters, BaseOptions } from '.';
import Entity from './Entity';
import { Color } from 'three';
import { baseEntityCreation } from './EntityCreation';

export interface TriggerEntity extends Entity {
	onEnter?: Function;
	onExit?: Function;
	hasEntered?: boolean;
}

export interface TriggerOptions extends BaseOptions {
	width?: number;
	height?: number;
	depth?: number;
	position?: Vector3;
	x?: number;
	y?: number;
	z?: number;
	onEnter: Function;
	onExit: Function;
	hasEntered: boolean;
}

export function Trigger(options: Partial<TriggerOptions>) {
	return (target: any) => {
		target.prototype._options = options;
		target.prototype._create = createAreaTrigger;
	}
}

const triggerDefaults: TriggerOptions = {
	debugColor: Color.NAMES.white,
	showDebug: false,
	position: new Vector3(0, 0, 0),
	onEnter: () => { },
	onExit: () => { },
	hasEntered: false
};

export function createAreaTrigger(params: CreationParameters) {
	const { entity, options, stage } = baseEntityCreation(params, triggerDefaults);

	const { width, height, depth } = options;
	const size = new Vector3(width, height, depth);

	const position = options.position;
	const color = options.debugColor;
	const geometry = new THREE.BoxGeometry(width, height, depth);
	entity.createDebugMesh(geometry, position, color);
	entity.createBody(position);
	entity.collisionRectangular(size, true);
	entity.collisionStatic();

	entity.showDebug = options.showDebug;

	(<TriggerEntity>entity).onEnter = options.onEnter;
	(<TriggerEntity>entity).onExit = options.onExit;
	(<TriggerEntity>entity).hasEntered = false;

	entity.isSensor = true;

	stage.addChild(entity.id, entity);

	return entity;
}
