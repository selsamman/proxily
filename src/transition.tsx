import {observedTransitionSequence, transitionSequence} from "./reactUse";
import {cloneObject, setInternalProps} from "./proxy/proxyCommon";
import {Target} from "./proxyObserve";
import {log, logLevel} from "./log";
import {getSnapshotMemos} from "./memoize";

interface Snapshot {
    sequence: number;
    target: Target;
}

export class Snapshots {

    snapshots: Map<number, Snapshot> = new Map();

    // Get a snapshot based on reported state version or fall back to current state
    getSnapshot(target: Target) {
        const ret = this.snapshots.get(observedTransitionSequence)?.target || target;
        if (logLevel.transitions)
            log(`snapshot for ${observedTransitionSequence} ${!!ret ? 'returned' : 'not found'}`);
        return ret;
    }

    // Create a new snapshot based on the transition sequence
    createSnapshotIfNeeded(target: Target) {
        if (!this.snapshots.get(transitionSequence)) {
            const newTarget = cloneObject(target);
            setInternalProps(newTarget, target.__transaction__, target.__proxy__, target.__parentTarget__, getSnapshotMemos(target));
            if (target.__memoizedProps__)
                newTarget.__memoizedProps__ = target.__memoizedProps__;
            this.snapshots.set(transitionSequence, {sequence: transitionSequence, target: newTarget});
            if (logLevel.transitions)
                log(`Creating snapshot object for transition ${transitionSequence} `);
        }
    }

    // Purge older snapshots
    static purgeCheckTimeout: any = 0;
    static toPurge: Set<Target> = new Set();

    static create(target : Target) {
        if (!target.__snapshot__)
            target.__snapshot__ = new Snapshots();
        target.__snapshot__.createSnapshotIfNeeded(target);
        Snapshots.toPurge.add(target);
    }

    static cleanup() {
        Snapshots.toPurge.forEach(target => target.__snapshot__ = undefined);
        Snapshots.toPurge.clear();
        if (logLevel.transitions)
            log(`Deleted all snapshots `);

    }
}

