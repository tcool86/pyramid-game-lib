import Stage from '../Stage';
import { Vector3 } from '../Util';
import { BaseOptions } from './Entity';
import Actor, { ActorLoader } from './Actor';

export interface ActorOptions extends BaseOptions {
	files: Array<string>;
	position?: Vector3;
}

export async function createActor(options: ActorOptions, stage: Stage) {
	// const position = options?.position || new Vector3(0, 0, 0);
	const file = options?.files[0] ?? '';
	const loader = new ActorLoader();
	const payload = await loader.load(file);
	const actor: Actor = new Actor(stage, payload);
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