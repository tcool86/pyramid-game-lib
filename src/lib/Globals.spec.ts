import Globals, { GameState, setGlobals, updateGlobals } from './Globals';

describe('Globals', () => {
	it('should be a singleton', () => {
		const globals1 = Globals.getInstance();
		const globals2 = Globals.getInstance();

		expect(globals1).toBe(globals2);
	});

	describe('set global state', () => {
		it('should initialize history if it does not exist', () => {
			const globals = Globals.getInstance();
			const state: GameState = { score: 0 };
			setGlobals(state);

			expect(globals.history).toBeDefined();
			expect(globals.current()).toEqual(state);
		});

		it('should add state to history', () => {
			const globals = Globals.getInstance();
			const state1: GameState = { score: 0 };
			const state2: GameState = { score: 1 };
			setGlobals(state1);
			setGlobals(state2);

			expect(globals.history.hasUndo).toBe(true);
			expect(globals.current()).toEqual(state2);
		});
	});

	describe('update global state', () => {
		it('should add updated state to history', () => {
			const globals = Globals.getInstance();
			const state1: GameState = { score: 0 };
			const state2: GameState = { score: 1 };
			globals.setState(state1);
			globals.update(state2);

			expect(globals.current()).toEqual({ score: 1 });

			globals.history.undo();
			expect(globals.current()).toEqual({ score: 0 });
		});

		it('should merge current state with updated state', () => {
			const globals = Globals.getInstance();
			const state1: GameState = { score: 0, level: 1 };
			const state2: GameState = { score: 1, completed: true };
			updateGlobals(state1);
			updateGlobals(state2);

			expect(globals.current()).toEqual({ score: 1, level: 1, completed: true });
		});
	});
});