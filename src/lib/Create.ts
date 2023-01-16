import { PyramidStage } from './Stage';

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

export async function createInternal(classInstance: any, parameters: any, stage: PyramidStage) {
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

export async function Create(stage: PyramidStage) {
	return {
		// create exposed to consumer
		create: async (entityClass: any, parameters: any = {}) => {
			const classInstance = new entityClass();
			return await createInternal(classInstance, parameters, stage);
		}
	}
}
