import { History } from 'stateshot';
export interface GameState {
    [prop: string]: any;
}
export default class Globals {
    private static instance;
    history: History;
    private constructor();
    static getInstance(): Globals;
    setState(state: GameState): void;
    update(state: GameState): void;
    current(): any;
}
