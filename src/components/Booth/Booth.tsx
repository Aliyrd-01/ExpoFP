import React, { useRef, useEffect } from "react";
import { useLocalStore, observer } from "mobx-react-lite";
import data from "../../data";
import store, { uiState } from "../../store";
import { RegularBooth, SpecialBooth } from "../../store/BoothStore";
import settings from "../../tools/settings";
import { remsToPixels } from "../../utils";
import { t } from "../../utils/i18n";
import OverlayContent from "../OverlayContent";
import Schedule from "../Schedule";
import SidebarActions from "../SidebarActions";
import "./Booth.scss";
import { BoothOnHold } from "./BoothOnHold";
import { BoothReserved } from "./BoothReserved";
import { BoothWithoutExhibitor } from "./BoothWithoutExhibitor";
import useHeatmapOverlay from "../../utils/useHeatmapOverlay";
import EntityItem, { EntityItemType } from "../EntityItem";

const Booth: React.FC = observer(() => {
    const scrollableRef = useRef<HTMLDivElement>();
    const s = useLocalStore(() => ({
        get booth() {
            return uiState.selectedBooth;
        },
        get regular() {
            return this.booth instanceof RegularBooth ? this.booth : null;
        },
        get special() {
            return this.booth instanceof SpecialBooth ? this.booth : null;
        },
        get showReserve() {
            return (
                !uiState.kiosk &&
                this.regular &&
                ((this.regular.price === "0" && !!this.regular.buyUrl) || !!this.regular.reserveUrl)
            );
        },
        get showBuy() {
            return !uiState.kiosk && this.regular && this.regular.buyUrl && this.regular.price && this.regular.price !== "0";
        },
        get title() {
            return this.booth.fullName;
        },
        get reserveTitle() {
            return data.reserveButtonTerm || t("Reserve");
        },
        get descriptionCombined() {
            return this.booth.description || data.reserveInstructions || "";
        },
    }));

    useEffect(() => {
        if (s.booth.schedule?.length) {
            const now = new Date();
            const sortedEvents = [...s.booth.schedule].sort(
                (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            );

            const hasPastEvents = sortedEvents.some((event) => {
                const endDate = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
                return endDate < now;
            });

            if (hasPastEvents) {
                const upcomingEvent = sortedEvents.find((event) => {
                    const endDate = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
                    return endDate > now;
                });

                if (upcomingEvent && scrollableRef.current) {
                    const eventElement = scrollableRef.current.querySelector(`[data-event-id="${upcomingEvent.id}"]`);
                    if (eventElement) {
                        setTimeout(() => {
                            const containerRect = scrollableRef.current.getBoundingClientRect();
                            const elementRect = eventElement.getBoundingClientRect();
                            const scrollTop = elementRect.top - containerRect.top - 20;
                            scrollableRef.current.scrollTop = scrollTop;
                        }, 100);
                    }
                }
            }
        }
    }, [s.booth.schedule]);

    function handleExhibitorClick(type: EntityItemType, data: string) {
        const id = parseInt(data);
        store.clickExhibitor(store.exhibitorStore.exhibitors.find((e) => e.id === id));
    }

    function handleEventClick(event) {
        store.selectEventItem(event, true);
    }

    const bar = <div className="booth__bar">{s.title}</div>;
    let content: JSX.Element = null;

    const { heatmapBar } = useHeatmapOverlay(s.booth);

    const exhibitors = s.booth.exhibitors.map((item) => (
        <EntityItem
            onClick={handleExhibitorClick}
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
                level: booth.layer?.name,
            }))}
            key={item.id.toString()}
        />
    ));

    if (data.isRebooking) {
        content = <>{exhibitors}</>;
    } else if (s.regular) {
        const b = s.regular;

        if (b.onHold) {
            content = <BoothOnHold booth={b} description={""} showBuy={false} showReserve={false} isRebooking={false} />;
        } else if (b.reserved) {
            content = <BoothReserved />;
        } else if (b.exhibitors.length === 0) {
            content = (
                <BoothWithoutExhibitor
                    booth={b}
                    description={s.descriptionCombined}
                    showBuy={!uiState.previewMode && s.showBuy}
                    showReserve={!uiState.previewMode && s.showReserve}
                    isRebooking={false}
                />
            );
        } else {
            content = <>{exhibitors}</>;
        }
    } else {
        content = (
            <div className="booth__content -spec">
                <div className="booth__desc" dangerouslySetInnerHTML={{ __html: s.special.description }} />
                <>{exhibitors}</>
            </div>
        );
    }

    return (
        <OverlayContent
            overlayBarCenterContent={heatmapBar}
            bar={bar}
            backMode="none"
            onClose={() => store.selectNone()}
            passScrollableRef={(ref) => {
                scrollableRef.current = ref.current;
            }}
        >
            {!data.isRebooking && settings.wayfinding && (
                <div className="exhibitor__directions" style={{ paddingLeft: 15, paddingRight: 15, marginTop: remsToPixels(1) }}>
                    <SidebarActions
                        showBookmark={false}
                        showShare={false}
                        onClickDirections={() => {
                            store.routeStore.clickRoute(null, s.booth);
                        }}
                    />
                </div>
            )}
            {content}
            {data.isRebooking && s.regular && s.regular.exhibitors.length === 0 && (
                <BoothWithoutExhibitor
                    showBuy={false}
                    description={s.descriptionCombined}
                    showReserve={false}
                    booth={s.regular}
                    isRebooking={data.isRebooking}
                />
            )}
            {!!s.booth.schedule?.length && (
                <Schedule
                    isAgenda={true}
                    showBooths={true}
                    events={[...s.booth.schedule].sort(
                        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
                    )}
                    onEventClick={handleEventClick}
                />
            )}
        </OverlayContent>
    );
});

export default observer(() => (!uiState.menu && uiState.selectedBooth ? <Booth /> : null));
