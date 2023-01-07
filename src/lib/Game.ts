
import RAPIER from '@dimforge/rapier3d-compat';
import Stage from './Stage';
import Menu from './Menu';
import { Create } from './Create';
import Gamepad, { ControllerInput } from './Gamepad';

import { Clock } from 'three';
import Globals from './Globals';

export interface LoopInterface {
	ticks: number;
	inputs: ControllerInput[];
	stage: Stage;
	globals: Globals;
}

export interface SetupInterface {
	commands: {
		create: Function;
	},
	globals: Globals;
}

interface GameOptions {
	loop: ({ }: LoopInterface) => void;
	setup: ({ }: SetupInterface) => void;
	globals: Globals;
}

function Game({ app, globals }: { app: HTMLElement, globals: Globals }) {
	return (target: any) => {
		const gameInstance = new target();
		const pyramidInstance = new PyramidGame({
			loop: gameInstance.loop.bind(gameInstance),
			setup: gameInstance.setup.bind(gameInstance),
			globals: globals
		});
		pyramidInstance.ready.then(() => {
			app.appendChild(pyramidInstance.domElement());
			gameInstance.ready.bind(gameInstance)();
		})
	}
}

class PyramidGame {
	stages: Stage[] = [];
	currentStage: number = 0;
	menu?: Menu;
	_globals: Globals;
	_loop: Function;
	_setup: Function;
	gamepad: Gamepad;
	pause: boolean;
	clock: Clock;
	ready: Promise<boolean>;

	constructor({ loop, setup, globals }: GameOptions) {
		this.gamepad = new Gamepad();
		this.clock = new Clock();
		this.pause = false;
		this._loop = loop;
		this._setup = setup;
		this._globals = globals;
		this.ready = new Promise(async (resolve, reject) => {
			try {
				const world = await this.loadPhysics();
				this.stages.push(new Stage(world));
				await this.gameSetup();
				const self = this;
				requestAnimationFrame(() => {
					self.gameLoop(self)
				});
				resolve(true);
			} catch (error) {
				reject(error);
			}
		});
	}

	async loadPhysics() {
		await RAPIER.init();
		const world = new RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 });

		return world;
	}

	/**
	 * Main game loop
	 * process user input
	 * update physics
	 * render scene
	 */
	async gameLoop(self: PyramidGame) {
		const inputs = this.gamepad.getInputs();
		const ticks = this.clock.getDelta();
		if (!this.pause) {
			this.stage().update({
				delta: ticks,
				inputs
			});
		}

		this._loop({
			ticks,
			inputs,
			stage: this.stage(),
			globals: this._globals,
			game: this,
		});

		this.stage().render();
		requestAnimationFrame(() => {
			self.gameLoop(self);
		});
	}

	async gameSetup() {
		const commands = Create(this.stage());
		this._setup({
			commands,
			globals: this._globals
		});
	}

	stage() {
		return this.stages[this.currentStage];
	}

	domElement() {
		const element = this.stage().renderer.domElement ?? document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
		return element;
	}
}

export default Game;
