
import RAPIER from '@dimforge/rapier3d-compat';
import { PyramidStage } from './Stage';
import Menu from './Menu';
import { Create } from './Create';
import Gamepad, { ControllerInput } from './Gamepad';

import { Clock } from 'three';
import Globals from './Globals';

export interface LoopInterface {
	ticks: number;
	inputs: ControllerInput[];
	stage: PyramidStage;
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

function Game({ app }: { app: HTMLElement | string }) {
	return (target: any) => {
		const gameInstance = new target();
		const pyramidInstance = new PyramidGame({
			loop: gameInstance.loop.bind(gameInstance),
			setup: gameInstance.setup.bind(gameInstance),
			globals: Globals.getInstance()
		});
		pyramidInstance.ready.then(() => {
			let appElement;
			if (typeof app === 'string') {
				appElement = document.querySelector<HTMLDivElement>('#app')!;
			} else {
				appElement = app;
			}
			appElement.appendChild(pyramidInstance.domElement());
			if (gameInstance.ready) {
				gameInstance.ready.bind(gameInstance)();
			}
		})
	}
}

class PyramidGame {
	stages: PyramidStage[] = [];
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
				this.stages.push(new PyramidStage(world));
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
			globals: this._globals,
			camera: this.stage()._camera
		});
	}

	stage() {
		return this.stages[this.currentStage];
	}

	domElement() {
		const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
		const element = this.stage().element() ?? canvas;
		return element;
	}
}

export default Game;
