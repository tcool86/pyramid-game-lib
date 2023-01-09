import Stage from "../Stage";
import Entity from "./Entity";
import { CreationParameters } from ".";
export declare const baseEntityCreation: (params: CreationParameters, entityDefaults: any) => {
    options: any;
    entity: Entity;
    stage: Stage;
};
