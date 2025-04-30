import React from "react";
import { ListItem } from "../store/types";
import { Exhibitor } from "../store/ExhibitorStore";
import { BoothBase } from "../store/BoothStore";
import { Category } from "../store/CategoryStore";
import { ScheduleItem } from "../store/ScheduleStore";
import { HeatmapYah } from "../store/HeatmapStore";
import useHeatmapData from "../utils/useHeatmapData";
import { boothStore, uiState } from "../store";
import EntityItem from "./EntityItem";
import YahRow from "./YahRow";
import data from "../data";
import dateFormat from "dateformat";
import { defaultRebookingOptions } from "./RebookingRadioGroup";

interface Props {
    item: ListItem;
    index: number;
    highlighted: boolean;
    onClick: (type: string, id: string) => void;
}

type SupportedHeatmapItem = Exhibitor | BoothBase | HeatmapYah;

export default function EntityListRow({ item, index, highlighted, onClick }: Props) {
    let heatmap = { background: undefined, clicks: undefined };

    if (uiState.heatmap && (item instanceof Exhibitor || item instanceof BoothBase || item instanceof HeatmapYah)) {
        heatmap = useHeatmapData(item as SupportedHeatmapItem);
    }

    if (item instanceof Exhibitor) {
        return (
            <EntityItem
                onClick={onClick}
                id={item.id.toString()}
                featured={item.featured}
                url={null}
                type="exhibitor"
                image={item.logo}
                title={item.name}
                bookmarked={item.bookmarked}
                visited={item.visited}
                additionalInfo={item.booths.map((booth) => ({
                    type: "location",
                    locationName: booth.name,
                    level: data.shortLevelName ? booth.layer?.shortName : booth.layer?.description,
                }))}
                highlighted={highlighted}
                heatmapColor={heatmap.background}
                heatmapClicks={heatmap.clicks}
                rebookingColor={data.isRebooking ? defaultRebookingOptions[item.rebookingState]?.color.primary : undefined}
                kioskMode={uiState.kiosk}
            />
        );
    }

    if ("rect" in item) {
        return (
            <EntityItem
                locationTerm={data.boothTerm}
                onClick={onClick}
                id={item.id.toString()}
                type="booth"
                title={item.name}
                url={null}
                icon={item.poiIcon}
                additionalInfo={[
                    {
                        type: "location",
                        locationName: item.name,
                        level: item.layer?.name,
                    },
                ]}
                highlighted={highlighted}
                heatmapColor={heatmap.background}
                heatmapClicks={heatmap.clicks}
            />
        );
    }

    if (item instanceof Category) {
        return (
            <EntityItem
                onClick={onClick}
                id={item.id.toString()}
                itemsCount={item.exhibitors.length}
                type="category"
                title={item.name}
                url={null}
                highlighted={highlighted}
            />
        );
    }

    if (item instanceof ScheduleItem) {
        const booth = item.boothId ? boothStore.booths.find((b) => b.id === item.boothId) : null;
        return (
            <EntityItem
                onClick={onClick}
                id={item.id.toString()}
                type="event"
                title={item.name}
                url={item.link}
                date={dateFormat(item.startDate, "dd mmm ddd")}
                time={`${dateFormat(item.startDate, "h:MM")} - ${dateFormat(item.endDate, "h:MM")}`}
                additionalInfo={
                    booth
                        ? [
                              {
                                  type: "location",
                                  locationName: booth.name,
                                  level: booth.layer?.name,
                              },
                          ]
                        : []
                }
                highlighted={highlighted}
                kioskMode={uiState.kiosk}
            />
        );
    }

    if (item instanceof HeatmapYah) {
        const cls = `list-row ${index === uiState.activeListIndex ? "active" : ""}`;
        return <YahRow yah={item} className={cls} />;
    }

    return null;
}
