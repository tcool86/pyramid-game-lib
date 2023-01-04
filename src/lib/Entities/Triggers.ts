import * as THREE from 'three';
import { Vector3 } from '../Util';
import { CreationParameters, BaseOptions } from '.';
import Entity from './Entity';
import { Color } from 'three';

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
};

export function createAreaTrigger({ classInstance, parameters, stage }: CreationParameters) {
	const { _options, constructor } = classInstance;

	const entity: TriggerEntity = new Entity(stage, constructor.name);
	if (classInstance.loop) {
		entity._loop = classInstance.loop.bind(classInstance);
	}
	if (classInstance.setup) {
		entity._setup = classInstance.setup.bind(classInstance);
	}
	entity._ref = classInstance;

	const options = Object.assign({}, triggerDefaults, _options, parameters);

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

	entity.onEnter = options.onEnter;
	entity.onExit = options.onExit;

	stage.addChild(entity.id, entity);
	stage.triggers.set(entity.id, entity);

	return entity;
}
