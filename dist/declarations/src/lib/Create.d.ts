import { PyramidStage } from './Stage';
export declare function createInternal(classInstance: any, parameters: any, stage: PyramidStage): Promise<any>;
export declare function Create(stage: PyramidStage): Promise<{
    create: (entityClass: any, parameters?: any) => Promise<any>;
}>;
