import Entity from "./Entity";
import { CreationParameters } from ".";

export const baseEntityCreation = (params: CreationParameters, entityDefaults: any) => {
	const { classInstance, parameters, stage } = params;
	const { _options, constructor } = classInstance;
	const entity = new Entity(stage, constructor.name);
	if (classInstance.loop) {
		entity._loop = classInstance.loop.bind(classInstance);
	}
	if (classInstance.setup) {
		entity._setup = classInstance.setup.bind(classInstance);
	}
	entity._ref = classInstance;

	const options = Object.assign({}, entityDefaults, _options, parameters);
	return { options, entity, stage };
}