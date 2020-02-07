// import { computed } from "mobx";
// import { Booth, BoothStateProvider } from "../core/Booth";
// import ExhibitorStore from "./ExhibitorStore";
// import UIState from "./UIState";

// export default class BoothState implements BoothStateProvider {
//     constructor(private uiState: UIState, private exhibitorStore: ExhibitorStore) {}
//     @computed({ keepAlive: true }) get listBoothNames() {
//         return boothSetToNameSet(this.uiState.listBooths);
//     }
//     @computed({ keepAlive: true }) get hoveredBoothNames() {
//         return boothSetToNameSet(this.uiState.hoveredBooths);
//     }
//     @computed({ keepAlive: true }) get selectedBoothNames() {
//         return boothSetToNameSet(this.uiState.selectedBooths);
//     }
//     @computed({ keepAlive: true }) get bookmarkedBoothNames() {
//         return this.exhibitorStore.bookmarkedBoothNames;
//     }
//     @computed({ keepAlive: true }) get exhibitorIdsByBoothNameMap() {
//         return this.exhibitorStore.exhibitorIdsByBoothNameMap;
//     }
//     @computed({ keepAlive: true }) get exhibitorByIdMap() {
//         return this.exhibitorStore.exhibitorByIdMap;
//     }
// }

// function boothSetToNameSet(set: Set<Booth>) {
//     return new Set(Array.from(set).map(x => x.name));
// }
