export interface Mutator {
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
    expression: string;
}