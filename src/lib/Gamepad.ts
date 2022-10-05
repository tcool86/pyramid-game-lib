
export type GamepadConnections = Map<number, boolean>;

export interface ControllerInput {
	horizontal: number;
	vertical: number;
	buttonA: number;
	buttonB: number;
	buttonX: number;
	buttonY: number;
	select: number;
	start: number;
}

export default class Gamepad {
	hasSupport: boolean;
	lastConnection: number;
	connections: GamepadConnections = new Map();
	keyboardInput: Map<string, boolean> = new Map();

	constructor() {
		this.hasSupport = true;
		this.lastConnection = -1;
		const interval = setInterval(() => {
			if (!this.hasSupport) {
				clearInterval(interval);
			}
			if (this.connections.size > this.lastConnection) {
				this.scanGamepads();
			}
		}, 200);
		window.addEventListener("gamepadconnected", (event: GamepadEvent) => {
			const { gamepad } = event;
			this.connections.set(gamepad.index, gamepad.connected);
		});
		window.addEventListener("gamepaddisconnected", (event: GamepadEvent) => {
			const { gamepad } = event;
			this.connections.delete(gamepad.index);
		});
		window.addEventListener("keydown", (event) => {
			const { key } = event;
			this.keyboardInput.set(key, true);
		});
		window.addEventListener("keyup", (event) => {
			const { key } = event;
			this.keyboardInput.set(key, false);
		});
	}

	scanGamepads() {
		const browserGamepadSupport = Boolean(navigator.getGamepads) ?? false;
		let gamepads;
		if (browserGamepadSupport) {
			gamepads = navigator.getGamepads();
		} else {
			console.warn("This browser doesn't support gamepads");
			this.hasSupport = false;
			return;
		}
		this.lastConnection = gamepads.length;
	}

	getInputAtIndex(index: number): ControllerInput {
		const gamepad = navigator.getGamepads()[index];
		const connected = this.connections.get(index);

		const up = this.keyboardInput.get('ArrowUp');
		const down = this.keyboardInput.get('ArrowDown');
		const left = this.keyboardInput.get('ArrowLeft');
		const right = this.keyboardInput.get('ArrowRight');
		const z = this.keyboardInput.get('z');
		const x = this.keyboardInput.get('x');

		let horizontal = 0 || (right) ? 1 : 0 || (left) ? -1 : 0;
		let vertical = 0 || (up) ? -1 : 0 || (down) ? 1 : 0;;
		let buttonA = 0 || (z) ? 1 : 0;
		let buttonB = 0 || (x) ? 1 : 0;

		if (!connected || !gamepad) {
			return {
				horizontal: horizontal,
				vertical: vertical,
				buttonA,
				buttonB,
				buttonX: 0,
				buttonY: 0,
				select: 0,
				start: 0,
			};
		}
		const [x1, y1] = gamepad.axes;
		horizontal = (Math.abs(x1) > 0.1) ? x1 : horizontal;
		vertical = (Math.abs(y1) > 0.1) ? y1 : vertical;
		buttonA = gamepad.buttons[0].value || buttonA;
		buttonB = gamepad.buttons[1].value || buttonB;
		return {
			horizontal,
			vertical,
			buttonA,
			buttonB,
			buttonX: 0,
			buttonY: 0,
			select: 0,
			start: 0,
		};
	}

	getInputs() {
		return [this.getInputAtIndex(0)];
	}
}
