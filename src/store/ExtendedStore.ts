import Vuex from "vuex";

const watcherTypes = ['bookmarked', 'inList', "skipDim", 'selected', 'hover'] as const;
type WatcherType = Extract<typeof watcherTypes[keyof typeof watcherTypes], string>;

export default class ExtendedStore extends Vuex.Store<any> {
    private readonly boothStateCache = new Map<number, BoothState>();
    private readonly watcherTypes = new Map<WatcherType, Map<number, Function[]>>(
        watcherTypes.map(x => [x, new Map])
    );


    constructor(args) {
        super(args);

        this.watch(((s, g) => g.hoveredBoothIds) as any, (v: number[], oldV: number[]) => {
            this.handleBoothSetsDifference(new Set(v), new Set(oldV), "hover");
        });

        this.watch(((s, g) => g.listBoothsIdsSet) as any, (v: Set<number>, oldV: Set<number>) => {
            this.handleBoothSetsDifference(v, oldV, "inList", "skipDim");
        });

        this.watch(((s, g) => g.selectedBoothIdsSet) as any, (v: Set<number>, oldV: Set<number>) => {
            this.handleBoothSetsDifference(v, oldV, "selected", "skipDim");
        });

        this.watch(((s, g) => g.bookmarkedArray) as any, (v: number[], oldV: number[]) => {
            const oldExhibitors = oldV.map(id => this.state.exhibitors[id].booths as number[]).reduce((p, c) => p.concat(c), []);
            const exhibitors = v.map(id => this.state.exhibitors[id].booths as number[]).reduce((p, c) => p.concat(c), []);
            this.handleBoothSetsDifference(new Set(exhibitors), new Set(oldExhibitors), "bookmarked");
        });
    }

    watchBoothState<T>(id: number, cb: Function, ...propTypes: WatcherType[]) {
        for (const type of propTypes) {
            const map = this.watcherTypes.get(type)
            let ar = map.get(id);
            if (!ar) {
                ar = [];
                map.set(id, ar);
            }
            ar.push(cb);
        }
    }

    private handleBoothSetsDifference(v: Set<number>, oldV: Set<number>, ...types: WatcherType[]) {
        const newElements = Array.from(v).filter(x => !oldV.has(x));
        const missingElements = Array.from(oldV).filter(x => !v.has(x));
        const allChanged = newElements.concat(missingElements);

        const cbs = new Set<Function>();

        for (const boothId of allChanged) {
            // invalidte booth state
            this.boothStateCache.delete(boothId);
            for (const type of types) {
                const map = this.watcherTypes.get(type)
                let ar = map.get(boothId);
                if (!ar) continue;
                for (const cb of ar) {
                    cbs.add(cb);
                }
            }
        }

        cbs.forEach(c => c());
    }
    getBoothState(b: Booth) {
        let state = this.boothStateCache.get(b.id);
        if (!state) {
            const g = this.getters;
            const hover = g.hoveredBoothIds.indexOf(b.id) !== -1;
            const selected = !!g.selectedBoothIdsSet.has(b.id);
            const inList = g.listBoothsIdsSet.has(b.id);
            const skipDim = inList || selected;
            const onhold = b.special == false && b.onHold;
            const empty = b.special == false && b.exhibitors.length === 0;
            const error = !!b.error;
            const bookmarked = b.special == false && !!b.exhibitors.find(e => this.state.bookmarked[e]);
            state = { hover, selected, skipDim, error, empty, onhold, bookmarked };

            this.boothStateCache.set(b.id, state);
        }
        return state;
    }
}

interface BoothState {
    hover: boolean;
    selected: boolean;
    skipDim: boolean;
    error: boolean;
    empty: boolean;
    onhold: boolean;
    bookmarked: boolean;
}

