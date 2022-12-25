import { PrimitiveOptions } from "./Entities/Primitives";
import { createBox, createSphere } from './Entities';
import Stage from './Stage';

function determineEntity(options: PrimitiveOptions) {
	const isSphere = options.radius;
	return isSphere ? createSphere : createBox;
}

export function create(options: PrimitiveOptions, stage: Stage) {
	const fn = determineEntity(options);
	return fn(options, stage);
}

export function Create(stage: Stage) {
	return {
		create: (options: PrimitiveOptions) => {
			return create(options, stage);
		}
	}
}