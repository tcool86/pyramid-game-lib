import Entity from '../Entity';
import { PrimitiveOptions } from '.';
import { Vector3, Vector2 } from '../../Util';
import { CreationParameters } from '..';
import { Color } from 'three';

export interface BoxOptions extends PrimitiveOptions {
	width: number;
	height: number;
	depth: number;
}

export function Box(options: Partial<BoxOptions>) {
	return (target: any) => {
		target.prototype._options = options;
		target.prototype._create = createBox;
	}
}

const boxDefaults: BoxOptions = {
	debugColor: Color.NAMES.white,
	showDebug: false,
	position: new Vector3(0, 0, 0),
	width: 1,
	height: 1,
	depth: 1,
	color: Color.NAMES.white,
	texturePath: null,
	textureSize: new Vector2(1, 1),
}

export function createBox({ classInstance, parameters, stage }: CreationParameters) {
	const { _options, constructor } = classInstance;
	// TODO: do all objects added to the stage via create share this?
	const entity = new Entity(stage, constructor.name);
	if (classInstance.loop) {
		entity._loop = classInstance.loop.bind(classInstance);
	}
	if (classInstance.setup) {
		entity._setup = classInstance.setup.bind(classInstance);
	}

	const options = Object.assign({}, boxDefaults, _options, parameters);

	const { width, height, depth } = options;
	const size = new Vector3(width, height, depth);

	const position = options.position;
	const color = options.color;
	const texturePath = options.texturePath;
	const textureSize = options.textureSize;
	entity.applyMaterial(texturePath, color, textureSize);
	entity.rectangularMesh(size, position);

	entity.createBody(position);
	entity.collisionRectangular(size);
	entity.body.setAdditionalMass(0.02, true);
	entity.body.setAngularDamping(0.1);
	if (options?.fixed) {
		entity.collisionStatic();
	}
	entity.debugColor = options.debugColor;
	entity.showDebug = options.showDebug;

	stage.addChild(entity.id, entity);

	return entity;
}

