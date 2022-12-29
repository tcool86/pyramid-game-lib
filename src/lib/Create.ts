import Stage from './Stage';
import { BaseOptions } from "./Entities/Entity";
import { PrimitiveOptions } from "./Entities/Primitives";
import { TriggerOptions } from "./Entities/Triggers";

// TODO: types here seem unecessary
type AnyOptions = BaseOptions & PrimitiveOptions & TriggerOptions;

function classType(classInstance: any) {
	if (!(typeof classInstance?.constructor === 'function')) {
		return null;
	}
	return classInstance.constructor.name;
}

function determineEntity(classInstance: any) {
	if (classType(classInstance) !== null) {
		return classInstance._create;
	}
}

export async function createInternal(classInstance: any, parameters: any, stage: Stage) {
	const fn = determineEntity(classInstance);
	if (classType(classInstance) !== null) {
		return fn({
			classInstance: classInstance,
			parameters,
			stage
		});
	}
	return fn(classInstance, stage);
}

export async function Create(stage: Stage) {
	return {
		create: async (entityClass: any, parameters: any = {}) => { // create exposed to consumer
			const classInstance = new entityClass();
			return await createInternal(classInstance, parameters, stage);
		}
	}
}
