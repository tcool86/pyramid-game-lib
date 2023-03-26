import Entity from '../Entity';
import { PrimitiveOptions } from '.';
import { Vector3, Vector2 } from '../../Util';
import { CreationParameters } from '..';
import { Color } from 'three';
import { baseEntityCreation } from '../EntityCreation';

export interface BoxOptions extends PrimitiveOptions { }

export function Box(options?: Partial<BoxOptions>) {
	return (target: any) => {
		target.prototype._options = options;
		target.prototype._create = createBox;
	}
}

const boxDefaults: BoxOptions = {
	debugColor: Color.NAMES.white,
	showDebug: false,
	position: new Vector3(0, 0, 0),
	size: new Vector3(1, 1, 1),
	color: Color.NAMES.white,
	texturePath: null,
	textureSize: new Vector2(1, 1),
	isSensor: false
}

export function createBox(params: CreationParameters) {
	const { entity, options, stage } = baseEntityCreation(params, boxDefaults);

	const { x: width, y: height, z: depth } = options.size;
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
	entity.collisionKey = options?.collisionKey;

	entity.isSensor = options.isSensor;

	stage.addChild(entity.id, entity);

	return entity;
}

