import { action, observable } from "mobx";

export default class FuzzySearchEngineStore {
    @observable engine;

    @action async loadEngine() {
        try {
            const FuseModule = await import("fuse.js");
            const Fuse = FuseModule.default;

            this.engine = new Fuse([], {
                keys: ["name", "layer.name"],
                threshold: 0.45,
                ignoreLocation: true,
            });
        } catch (err) {
            console.error(err);
        }
    }
}
