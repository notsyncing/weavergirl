export interface Mutator {
    info: any,
    parent: Node,
    beginPatternNode: Node,
    beginIndex: number,
    endPatternNode: Node,
    endIndex: number,
    childNodes: Array<Node>
}