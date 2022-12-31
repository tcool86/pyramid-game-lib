
import RAPIER from '@dimforge/rapier3d-compat';
import Stage from './Stage';
import Menu from './Menu';
import { Create } from './Create';
import { TriggerOptions, TriggerEntity } from './Entities/Triggers';
import Gamepad, { ControllerInput } from './Gamepad';

import { Clock } from 'three';

export interface LoopInterface {
	ticks: number;
	inputs: ControllerInput[];
	stage: Stage;
}

export interface SetupInterface {
	triggers: {
		createAreaTrigger(options: TriggerOptions): TriggerEntity;
	};
	materials: {
		metal: THREE.Material;
	};
}

interface GameOptions {
	loop: ({ }: LoopInterface) => void;
	setup: ({ }: SetupInterface) => void;
}

function Game(app: HTMLElement) {
	return (target: any) => {
		const gameInstance = new target();
		const pyramidInstance = new PyramidGame({
			loop: gameInstance.loop.bind(gameInstance),
			setup: gameInstance.setup.bind(gameInstance),
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
	_loop: Function;
	_setup: Function;
	gamepad: Gamepad;
	clock: Clock;
	ready: Promise<boolean>;

	constructor({ loop, setup }: GameOptions) {
		this.gamepad = new Gamepad();
		this.clock = new Clock();
		this._loop = loop;
		this._setup = setup;
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
		this.stage().update({
			delta: ticks,
			inputs
		});

		const player = this.stage().getPlayer() ?? { move: () => { } };
		this._loop({
			ticks,
			inputs,
			player,
			stage: this.stage()
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
