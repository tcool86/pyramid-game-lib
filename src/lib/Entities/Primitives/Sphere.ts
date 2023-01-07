import Entity from '../Entity';
import { Vector3, Vector2 } from '../../Util';
import { PrimitiveOptions } from ".";
import { CreationParameters } from '..';
import { Color, PointLight } from 'three';

export interface SphereOptions extends PrimitiveOptions {
	radius: number;
}

export function Sphere(options?: Partial<SphereOptions>) {
	return (target: any) => {
		target.prototype._options = options;
		target.prototype._create = createSphere;
	}
}

const sphereDefaults: SphereOptions = {
	debugColor: Color.NAMES.white,
	showDebug: false,
	position: new Vector3(0, 0, 0),
	radius: 1,
	color: Color.NAMES.white,
	texturePath: null,
	textureSize: new Vector2(1, 1),
	glow: false,
	isSensor: false
}

export function createSphere({ classInstance, parameters, stage }: CreationParameters) {
	const { _options, constructor } = classInstance;

	const entity = new Entity(stage, constructor.name);
	if (classInstance.loop) {
		entity._loop = classInstance.loop.bind(classInstance);
	}
	if (classInstance.setup) {
		entity._setup = classInstance.setup.bind(classInstance);
	}
	entity._ref = classInstance;

	const options = Object.assign({}, sphereDefaults, _options, parameters);

	const radius = options.radius;
	const position = options.position;
	const color = options.color;
	const texturePath = options.texturePath;
	const textureSize = options.textureSize;
	entity.applyMaterial(texturePath, color, textureSize);
	entity.sphericalMesh(radius, position);

	entity.createBody(position);
	entity.collisionSpherical(radius, options.isSensor);
	entity.body.setAdditionalMass(0.02, true);
	entity.body.setAngularDamping(0.1);

	entity.debugColor = options.debugColor;
	entity.showDebug = options.showDebug;
	entity.collisionKey = options?.collisionKey;

	entity.isSensor = options.isSensor;

	if (options.glow) {
		// TODO: give more customizable options for "glow"
		const light = new PointLight(color, 1, 100);
		light.position.set(0, 0, 0);
		entity.mesh?.add(light);
	}

	stage.addChild(entity.id, entity);

	return entity;
}
