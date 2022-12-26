import { PrimitiveOptions } from "./Entities/Primitives";
import { createBox, createSphere } from './Entities';
import Stage from './Stage';
import { createAreaTrigger, TriggerOptions } from "./Entities/Triggers";
import { BaseOptions } from "./Entities/Entity";

type AnyOptions = BaseOptions & PrimitiveOptions & TriggerOptions;

function determineEntity(options: AnyOptions) {
	const hasActions = (<TriggerOptions>options).action;
	if (hasActions) {
		return createAreaTrigger;
	}
	const isSphere = (<PrimitiveOptions>options).radius;
	return isSphere ? createSphere : createBox;
}

export function create(options: AnyOptions, stage: Stage) {
	const fn = determineEntity(options);
	return fn(options, stage);
}

export function Create(stage: Stage) {
	return {
		create: (options: AnyOptions) => {
			return create(options, stage);
		}
	}
}
