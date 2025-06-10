import type { Booth } from "./BoothStore";
import type { Category } from "./CategoryStore";
import type { Exhibitor } from "./ExhibitorStore";
import type { Language } from "./LanguageStore";
import type { ScheduleItem } from "./ScheduleStore";
import { HeatmapYah } from "./HeatmapStore";

export type FilterType = { type: "filter"; items: ListItem[]; query: { key: string; value: string } };

export type ListType =
    | { type: "search"; text: string; focused: boolean }
    | { type: "bookmarks" }
    | { type: "category"; category: Category }
    | { type: "language"; id: string }
    | FilterType;

export type OverlaySize = "full" | "medium" | "small";

export type ListItem = Booth | Exhibitor | Category | ScheduleItem | Language | HeatmapYah;

export interface Visibility {
    controls?: boolean;
    levels?: boolean;
    header?: boolean;
    overlay?: boolean;
}

export interface FilterItem {
    id: number | string;
    name: string;
}

export interface FilterGroup {
    groupName: string;
    items: FilterItem[];
}

export interface FilterState {
    isOpen: boolean;
    selectedItems: FilterItem[];
    pendingItems: FilterItem[];
}

export interface FilterStore {
    state: FilterState;
    openFilter(): void;
    closeFilter(): void;
    applyFilter(): void;
    resetFilter(): void;
    setPendingItems(items: FilterItem[]): void;
    getFilteredItems(): FilterItem[];
    publicRootStore: any;
}
