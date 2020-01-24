// import RootStore from "../RootStore";
// import { autorun, runInAction } from "mobx";
// import Api from "../../services/Api";

// export default function initApi(store: RootStore) {
//     const apiStore = store.apiStore;
//     const authMatch = window.location.search.match(/ea81h(.+)97ab537/);
//     const token = authMatch ? authMatch[1] : sessionStorage.getItem("apiToken");

//     if (token) {
//         runInAction(() => {
//             apiStore.apiToken = token;
//             apiStore.apiTokenStatus = "UNVALIDATED";
//         });
//     }

//     if (authMatch) {
//         const token = authMatch[1];
//         // start validating token here
//         // if valid, add to session
//     } else {
//         const sessionToken = sessionStorage.getItem("apiToken");
//         apiStore.apiToken = sessionToken;
//     }

//     let validatingToken;

//     autorun(() => {
//         const token = apiStore.apiToken;
//         if (token) {
//             const api = new Api(token);
//         }
//         // make a call in Api service to get all events for this token and see if it works
//         // Q: how do we get to API service???
//         // How to handle 403 after that?
//     });
// }
