import { action, observable } from "mobx"

export default class FuzzySearchEngineStore {
    @observable engine;

    @action async loadEngine() {
        try {
            const FuseModule = await import("fuse.js");
            const Fuse = FuseModule.default;

            this.engine = new Fuse([], {
                keys: [
                    { name: "name", weight: 1 },
                    { name: "description", weight: 0.5 },
                    { name: "layer.name", weight: 0.1 },
                ],
                ignoreDiacritics: true,
                ignoreFieldNorm: true,
                includeScore: true,
                includeMatches: true,
                findAllMatches: true,
                shouldSort: false,
            });
        } catch (err) {
            console.error(err);
        }
    }
}
