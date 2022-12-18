import Debug from './lib/Debug';
import Game from './lib/Game';
import Gamepad from './lib/Gamepad';
import Globals from './lib/Globals';
import Menu from './lib/Menu';
import Stage from './lib/Stage';
import Util from './lib/Util';
import { Actor, Primitives, Collision } from './lib/Entities';

const Pyramid = {
	Debug,
	Game,
	Gamepad,
	Globals,
	Menu,
	Stage,
	Entity: { Actor, Primitives, Collision },
	Util,
}
export default Pyramid;