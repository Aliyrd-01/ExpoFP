import { configure } from 'mobx';

configure({ computedRequiresReaction: true, enforceActions: 'observed' });

export default class RootStore {
    constructor() {
    }
}

