import Stage from './Stage';
export declare function createInternal(classInstance: any, parameters: any, stage: Stage): Promise<any>;
export declare function Create(stage: Stage): Promise<{
    create: (entityClass: any, parameters?: any) => Promise<any>;
}>;
