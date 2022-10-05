import { History } from 'stateshot';
export interface GameState {
    [prop: string]: any;
}
export default class Globals {
    history: History;
    constructor(state: GameState);
    update(state: GameState): void;
    current(): any;
}
