import Entity from "./Entity";

export class Frame {
	internalTimer: number;
	reset: number;
	callback: Function;

	constructor(callback: Function, internalTimer: number, delta: number) {
		this.reset = internalTimer;
		this.callback = callback;
		this.internalTimer = delta;
	}

	update(delta: number) {
		this.internalTimer += delta;
		if (this.internalTimer >= this.reset) {
			this.internalTimer = 0;
			this.callback();
		}
	}
}

export const frameMaker = (delta: number, self: Entity) => {
	return (timer: number, callback: Function) => {
		const key = `${callback.toString()}-${timer}`;
		const savedFrame = self._frames.get(key);
		if (savedFrame) {
			savedFrame.update(delta);
			return;
		}
		const _frame = new Frame(callback, timer, delta);
		self._frames.set(key, _frame);
	}
}