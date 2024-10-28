import classNames from "classnames";
import { IReactionDisposer, reaction } from "mobx";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import store, { exhibitorStore, uiState } from "../store";
import { Exhibitor } from "../store/ExhibitorStore";
import { remsToPixels, shuffle } from "../utils";
import { useInit } from "../utils/mobx";
import "./Ws.scss";
import { loadImagesInBatchesById } from "../utils/loadImagesInBatches";

function Ws() {
    const s = useLocalStore(() => ({
        el: null as HTMLElement,
        all: [] as Exhibitor[],
        adv: [] as { key: number; e: Exhibitor }[],
        keySeq: 0,
        index: 0,
        imgByExhibitorId: new Map<number, HTMLImageElement>(),
        batchSize: 100,
        loading: false,
        intervalId: 0,
        get sectionStyle() {
            const style = {
                width: uiState.overlayPosition === "left" ? `${uiState.wsWidthPx}px` : "100%",
                // todo: remove
                opacity: uiState.wsStarted ? 1 : 0,
                padding: `0 ${uiState.wsPaddingPx}px`,
            } as any;

            if (uiState.wsPosition === "top") style.top = uiState.headerHeightPx + "px";
            else style.bottom = 0;
            return style;
        },
    }));

    useInit(() => {
        let dispose: IReactionDisposer;
        let isMounted = true;

        (async function () {
            s.all = shuffle(exhibitorStore.advertised);
            s.imgByExhibitorId = await loadExhibitorImages();
            if (!isMounted) return;
            setupNext();
            mouseout();
            uiState.wsStarted = true;

            dispose = reaction(() => uiState.screenSize, setupNext);
        })();

        return () => {
            isMounted = false;
            if (dispose) {
                dispose();
            }
            if (s.intervalId) {
                window.clearInterval(s.intervalId);
                s.intervalId = 0;
            }
        };
    });

    return useObserver(() => (
        <section
            className={classNames("ws")}
            ref={(n) => (s.el = n)}
            onMouseOver={mouseover}
            onMouseOut={mouseout}
            style={s.sectionStyle}
        >
            <TransitionGroup component={null}>
                {s.adv.map((e) => (
                    <CSSTransition key={e.key} timeout={500}>
                        <a
                            href={`?${e.e.slug}`}
                            className="ws__exhibitor"
                            style={{ height: `${uiState.wsImageHeightPx}px` }}
                            onClick={(x) => {
                                x.preventDefault();
                                select(e.e);
                            }}
                        >
                            <img src={e.e.logo} alt={e.e.name} crossOrigin="anonymous" />
                        </a>
                    </CSSTransition>
                ))}
            </TransitionGroup>
        </section>
    ));

    function setupNext() {
        const rectWidth = s.el.getBoundingClientRect().width;
        const maxWidth = rectWidth - remsToPixels(0.3) * 2; // exclude padding
        let filledWidth = 0;
        const adv = [] as { key: number; e: Exhibitor }[];
        // let key = 0;
        do {
            const e = s.all[s.index % s.all.length];

            if (!s.imgByExhibitorId.has(e.id)) break;

            const img = s.imgByExhibitorId.get(e.id);
            const width = (img.width * uiState.wsImageHeightPx) / img.height + 20; //padding

            if (filledWidth + width > maxWidth && adv.length) break;

            filledWidth += width;
            adv.push({ key: s.keySeq++, e });
            s.index = (s.index + 1) % s.all.length;
        } while (true);
        s.adv = adv;
        // if (!uiState.wsStarted) store.commit("setWsStarted", true);
    }

    function select(e: Exhibitor) {
        store.clickExhibitor(e);
        // this.$store.dispatch("clickExhibitor", e);
    }

    function mouseover() {
        if (s.intervalId) {
            window.clearInterval(s.intervalId);
            s.intervalId = 0;
        }
    }

    function mouseout() {
        clearInterval(s.intervalId);
        s.intervalId = window.setInterval(async () => {
            if (s.loading) return;
            s.imgByExhibitorId = await loadExhibitorImages();
            setupNext();
        }, 8000);
    }

    async function loadExhibitorImages(): Promise<Map<number, HTMLImageElement>> {
        s.loading = true;

        let batch = s.all.slice(s.index, s.index + s.batchSize);
        if (batch.length < s.batchSize) {
            batch = batch.concat(s.all.slice(0, s.batchSize - batch.length));
        }

        const result = await loadImagesInBatchesById(
            new Map<number, string>(batch.map(x => [x.id, x.logo])),
        );
        s.loading = false;

        return result;
    }
}

export default () => useObserver(() => <>{uiState.wsShown ? <Ws /> : null}</>);
