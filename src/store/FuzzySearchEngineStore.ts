import { action, observable, runInAction } from "mobx";

export default class FuzzySearchEngineStore {
    loaded = false;
    pendingPromise = null;
    @observable engine;

    @action loadEngine() {
        if (this.loaded) {
            return Promise.resolve();
        }

        if (this.pendingPromise) {
            return this.pendingPromise;
        }

        this.pendingPromise = (async () => {
            try {
                const FuseModule = await import("fuse.js");
                const Fuse = FuseModule.default;

                const newEngine = new Fuse([], {
                    keys: ["name", "description", "layer.name", "title", "fullName"],
                    ignoreDiacritics: true,
                    ignoreFieldNorm: true,
                    includeScore: true,
                    includeMatches: true,
                    findAllMatches: true,
                    shouldSort: false,
                });

                runInAction(() => {
                    this.engine = newEngine;
                    this.loaded = true;
                });
            } catch (err) {
                console.error(err);

                runInAction(() => {
                    this.pendingPromise = null;
                });
            }
        })();

        return this.pendingPromise;
    }
}
