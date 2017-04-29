import Stage from "../router/stage";

export interface Mutator {
    stage: Stage;
    info: MutatorInfo;
    parent: Node;
    beginPatternNode: Node;
    beginIndex: number;
    endPatternNode: Node;
    endIndex: number;
    childNodes: Array<Node>;
}

export interface MutatorInfo {
    id: number;
    type: string;
    expressions: Array<string>;
}

export interface AttributeMutatorInfo extends MutatorInfo {
    attribute: string;
}

export interface DelegateMutatorInfo extends MutatorInfo {
    delegate: string | ((elem: Element, newValue: any) => void);
}