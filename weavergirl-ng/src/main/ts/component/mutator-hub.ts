import {Mutator} from "./mutator";
import Stage from "../router/stage";
import Component from "./component";

export default class MutatorHub {
    private static mutatorCounter = 0;

    static mutatorBeginPattern = "#weavergirl-mutator ";
    static mutatorEndPattern = "#/weavergirl-mutator";

    static mutatorFunctions = new Map<number, Function>();

    mutators = new Map<string, Array<Mutator>>();

    private mutatorExprDeps = new Map<string, Array<string>>();

    constructor(private stage: Stage) {

    }

    static allocateMutatorId(): number {
        let n = MutatorHub.mutatorCounter;
        MutatorHub.mutatorCounter++;
        return n;
    }

    static setMutatorFunction(id: number, func: Function): void {
        MutatorHub.mutatorFunctions.set(id, func);
    }

    clearMutators(): void {
        this.mutators.clear();
        MutatorHub.mutatorFunctions.clear();
    }

    static resetMutatorId(): void {
        MutatorHub.mutatorCounter = 0;
    }

    static resetMutators(): void {
        for (let s of Component.stages.values()) {
            s.mutatorHub.clearMutators();
        }

        MutatorHub.resetMutatorId();
    }

    registerMutator(mutator: Mutator, _into = this.mutators): void {
        for (let expression of mutator.info.expressions) {
            if (!_into.has(expression)) {
                _into.set(expression, [mutator]);
            } else {
                let l = _into.get(expression);

                for (let m of l) {
                    if (m.info.id === mutator.info.id) {
                        return;
                    }
                }

                l.push(mutator);
            }
        }
    }

    static collectUnusedMutatorId(elem: Node = document): void {
        if (MutatorHub.mutatorFunctions.size <= 0) {
            console.info(`Mutator cache collection result: no need to collect.`);
            return;
        }

        let newFunctionMap = new Map<number, Function>();
        let newStageMutatorMap = new Map<Stage, Map<string, Array<Mutator>>>();

        let mutatorStack: Array<Mutator> = [];

        function _process(stage: Stage, n: Node) {
            stage.handleMutatorNode(n, mutatorStack, m => {
                if (MutatorHub.mutatorFunctions.has(m.info.id)) {
                    newFunctionMap.set(m.info.id, MutatorHub.mutatorFunctions.get(m.info.id));
                }

                stage.mutatorHub.registerMutator(m, newStageMutatorMap.get(stage));
            });

            for (let c of n.childNodes) {
                _process(stage, c);
            }
        }

        for (let s of Component.stages.values()) {
            newStageMutatorMap.set(s, new Map());
            _process(s, elem);

            console.info(`Stage ${s.constructor.name} mutator collection result: previous ${s.mutatorHub.mutators.size}, now ${newStageMutatorMap.get(s).size}, collected ${s.mutatorHub.mutators.size - newStageMutatorMap.get(s).size}`);

            s.mutatorHub.mutators = newStageMutatorMap.get(s);
        }

        console.info(`Mutator cache collection result: previous ${MutatorHub.mutatorFunctions.size}, now ${newFunctionMap.size}, collected ${MutatorHub.mutatorFunctions.size - newFunctionMap.size}`);

        MutatorHub.mutatorFunctions = newFunctionMap;
    }

    private resolveMutatorExpressionDependencies(expr: string, into: Array<Mutator>): void {
        if (!this.mutatorExprDeps.has(expr)) {
            return;
        }

        for (let e of this.mutatorExprDeps.get(expr)) {
            if (this.mutators.has(e)) {
                for (let m of this.mutators.get(e)) {
                    into.push(m);
                }
            }

            this.resolveMutatorExpressionDependencies(e, into);
        }
    }

    getMutatorsByExpression(expr: string): Array<Mutator> {
        let l: Array<Mutator> = [];

        if (this.mutators.has(expr)) {
            l = l.concat(this.mutators.get(expr));
        }

        this.resolveMutatorExpressionDependencies(expr, l);

        console.dir(l);

        return l;
    }

    registerMutatorExpressionDependencies(expr: string, deps: Array<string>): void {
        for (let d of deps) {
            if (this.mutatorExprDeps.has(d)) {
                let l = this.mutatorExprDeps.get(d);

                if (l.indexOf(expr) < 0) {
                    l.push(expr);
                }
            } else {
                this.mutatorExprDeps.set(d, [expr]);
            }
        }
    }
}