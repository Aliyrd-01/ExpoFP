import type { Booth } from "./BoothStore";
import type { Category } from "./CategoryStore";
import type { Exhibitor } from "./ExhibitorStore";
import type { Language } from "./LanguageStore";
import type { ScheduleItem } from "./ScheduleStore";

export type ListType =
    | { type: "search"; text: string; focused: boolean }
    | { type: "bookmarks" }
    | { type: "category"; category: Category }
    | { type: "language", id: string };

export type OverlaySize = "full" | "medium" | "small";

export type ListItem = Booth | Exhibitor | Category | ScheduleItem | Language;
