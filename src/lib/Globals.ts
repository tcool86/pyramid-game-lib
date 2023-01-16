import { History } from 'stateshot';

export interface GameState {
	[prop: string]: any;
}

export default class Globals {
	private static instance: Globals;

	history!: History;

	private constructor() { }

	public static getInstance(): Globals {
		if (!Globals.instance) {
			Globals.instance = new Globals();
		}
		return Globals.instance;
	}

	setState(state: GameState) {
		if (!this.history) {
			this.history = new History();
		}
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