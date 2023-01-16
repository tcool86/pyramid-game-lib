import Entity from "./Entity";
import { CreationParameters } from ".";
export declare const baseEntityCreation: (params: CreationParameters, entityDefaults: any) => {
    options: any;
    entity: Entity;
    stage: import("../Stage").PyramidStage;
};
