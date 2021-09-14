import {getObservedTransitionSequence, getTransitionSequence} from "./reactUse";
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
        const ret = this.snapshots.get(getObservedTransitionSequence())?.target || target;
        if (logLevel.transitions)
            log(`snapshot for ${getObservedTransitionSequence()} ${!!ret ? 'returned' : 'not found'}`);
        return ret;
    }

    // Create a new snapshot based on the transition sequence
    createSnapshotIfNeeded(target: Target) {
        if (!this.snapshots.get(getTransitionSequence())) {
            const newTarget = Object.create(Object.getPrototypeOf(target));
            Object.defineProperties(newTarget, Object.getOwnPropertyDescriptors(target));
            newTarget.__memoContexts__ = getSnapshotMemos(target);
            this.snapshots.set(getTransitionSequence(), {sequence: getTransitionSequence(), target: newTarget});
            if (logLevel.transitions)
                log(`Creating snapshot object for transition ${getTransitionSequence()} `);
        }
    }

    // Purge older snapshots
    static toPurge: Set<Target> = new Set();

    static create(target : Target) {
        if (!target.__snapshot__)
            target.__snapshot__ = new Snapshots();
        target.__snapshot__.createSnapshotIfNeeded(target);
        Snapshots.toPurge.add(target);
    }

    static cleanup() {
        const purged = Snapshots.toPurge.size > 0;
        Snapshots.toPurge.forEach(target => target.__snapshot__ = undefined);
        Snapshots.toPurge.clear();
        if (purged && logLevel.transitions)
            log(`Deleted all snapshots `);

    }
}

