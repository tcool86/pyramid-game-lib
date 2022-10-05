import { History } from 'stateshot';

export interface GameState {
	[prop: string]: any;
}

export default class Globals {
	history: History;

	constructor(state: GameState) {
		this.history = new History();
		this.history.pushSync(state);
	}

	update(state: GameState) {
		const current = this.current();
		this.history.pushSync({
			...current,
			...state
		});
	}

	current() {
		return this.history.get();
	}
}