import { observable, computed, action } from 'mobx';
import RootStore from "./RootStore";
import { remsToPixels } from '../utils';
import { Exhibitor } from './ExhibitorStore';
import { Booth } from './BoothStore';

type ListType = { type: "search"; text: string; focused: boolean } | { type: "bookmarks" } | { type: "category"; id: number };
export type OverlaySize = "full" | "medium" | "small";
export type ScreenSize = { width: number, height: number };

export default class UIState {
    private readonly rootStore: RootStore;

    @observable.struct list: ListType = { type: "search", text: "", focused: false };
    @observable.ref details: Booth | Exhibitor = null;
    @observable menu = false;
    @observable searchFocused = false;
    @observable printingPdf = false;
    @observable.struct screenSize: ScreenSize;
    @observable overlaySize: OverlaySize = "medium";
    @observable overlayShowsAll = false;
    @observable centerMap = false;
    @observable activeListIndex = -1;

    overlayMediumHeightRems = 10;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    ///////////////////////////////////////////////////////////////////////////
    // positions
    @computed get overlayPosition() {
        if (!this.screenSize || this.screenSize.width > 550) return "left";
        return "bottom";
    }

    @computed get overlayBottom() { return this.overlayPosition === "bottom"; }
    @computed get overlayLeft() { return this.overlayPosition === "left"; }
    @computed get overlayWidthPx() { return this.overlayLeft ? remsToPixels(23.5) : remsToPixels(this.screenSize.width); }

    @computed get wsWidthPx() { return this.overlayLeft ? this.screenSize.width - this.overlayWidthPx : this.screenSize.width; }
    @computed get wsImageHeightPx() { return remsToPixels(3); }
    @computed get wsPaddingPx() { return remsToPixels(0.3); }
    @computed get wsOccupiedHeightPx() { return this.wsShown ? this.wsImageHeightPx + this.wsPaddingPx * 2 : 0; }
    @computed get wsShown() {
        // TODO: RESTORE
        return false;//this.advertisedExhibitors.length > 0;
    }

    @computed get wsDesktopPosition() { return process.env.REACT_APP_EFP_EXPO === "cbresupplypartner" ? "bottom" : "top" }
    @computed get wsPosition() { return this.overlayBottom ? "top" : this.wsDesktopPosition; }
    // map
    @computed get mapVisibleTop() { return this.wsPosition === "top" ? this.wsOccupiedHeightPx : 0; }
    @computed get mapVisibleBottom() {
        if (this.overlayLeft) {
            return this.wsPosition === "bottom" ? this.wsOccupiedHeightPx : 0;
        }
        return remsToPixels(this.overlayMediumHeightRems);
    }
    @computed get mapVisibleLeft() { return this.overlayLeft ? this.overlayWidthPx : 0; }
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    // actions
    @action toggleMapOverlay() {
        if (this.overlayPosition === "bottom" && this.overlaySize === "full") this.overlaySize = "medium";
        else if (this.overlayPosition === "bottom" && this.overlaySize !== "full") this.overlaySize = "full";
    }

    ///////////////////////////////////////////////////////////////////////////
}



