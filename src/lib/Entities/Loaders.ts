import Stage from '../Stage';
import { ActorLoader, PyramidActor, ActorOptions } from './Actor';

export async function createActor(target: any, stage: Stage) {
	const loader = new ActorLoader();
	const payload = await loader.load(target.options.files);
	const actor: PyramidActor = new PyramidActor({ stage, payload });
	stage.children.set(actor.id, actor);
	// TODO: condition for player
	stage.players.set(actor.id, actor);
	return actor;
}

export function Loaders(stage: Stage) {
	return {
		createActor: async (options: ActorOptions) => {
			return await createActor(options, stage)
		},
	}
}