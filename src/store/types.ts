import type { Booth } from "./BoothStore";
import type { Category } from "./CategoryStore";
import type { Exhibitor } from "./ExhibitorStore";
import type { Language } from "./LanguageStore";
import type { ScheduleItem } from "./ScheduleStore";

export type FilterType = { type: "filter"; items: ListItem[], query: { key: string, value: string } };

export type ListType =
    | { type: "search"; text: string; focused: boolean }
    | { type: "bookmarks" }
    | { type: "category"; category: Category }
    | { type: "language"; id: string }
    | FilterType;


export type OverlaySize = "full" | "medium" | "small";

export type ListItem = Booth | Exhibitor | Category | ScheduleItem | Language;

export interface Visibility {
    controls?: boolean;
    levels?: boolean;
    header?: boolean;
    overlay?: boolean;
}
