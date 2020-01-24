// // import { observable } from 'mobx';
// import { action, observable } from "mobx";
// import RootStore from "./RootStore";

// export default class ApiStore {
//     private readonly rootStore: RootStore;

//     @observable apiToken: string;
//     @observable apiTokenStatus: "UNSET" | "UNVALIDATED" | "VALID" | "INVALID" = "UNSET";

//     constructor(rootStore: RootStore) {
//         this.rootStore = rootStore;
//     }

//     // @action setApiToken(token: string) {
//     //     this.apiToken = token;
//     //     this.apiTokenStatus = "UNVALIDATED";
//     // }
// }

// /*
// API token, session storage, other

// let's define init of all

// store - contains hierarchy of data, and actions that modify those in a transation
//     actions now are user event handlers

// services
//     they can have non-observable internal state and can modify store - all UI depends solely on store
//     they can be objects with API

// init sequence

// dependencies are resolved consequently


// */
