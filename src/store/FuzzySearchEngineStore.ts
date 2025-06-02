import { action, observable } from "mobx"

export default class FuzzySearchEngineStore {
    @observable engine;

    @action async loadEngine() {
        try {
            const FuseModule = await import("fuse.js");
            const Fuse = FuseModule.default;

            this.engine = new Fuse([], {
                keys: ["name", "description", "layer.name", "title", "fullName"],
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
