import classNames from "classnames";
import { IReactionDisposer, reaction } from "mobx";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { useCallback } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import store, { exhibitorStore, uiState } from "../store";
import { Exhibitor } from "../store/ExhibitorStore";
import { remsToPixels, shuffle } from "../utils";
import { useInit } from "../utils/mobx";
import "./Ws.scss";
import { loadImagesInBatchesById } from "../utils/loadImagesInBatches";

const Ws = React.memo(() => {
    const s = useLocalStore(() => ({
        el: null as HTMLElement | null,
        all: [] as Exhibitor[],
        adv: [] as { key: number; e: Exhibitor }[],
        keySeq: 0,
        index: 0,
        imgByExhibitorId: new Map<number, HTMLImageElement>(),
        batchSize: 100,
        loading: false,
        leftToNextLoad: 0,
        intervalId: 0,
        get sectionStyle() {
            return {
                width: uiState.overlayPosition === "left" ? `${uiState.wsWidthPx}px` : "100%",
                opacity: uiState.wsStarted ? 1 : 0,
                padding: `0 ${uiState.wsPaddingPx}px`,
                ...(uiState.wsPosition === "top" ? { top: uiState.headerHeightPx + "px" } : { bottom: 0 }),
            };
        },
    }));

    const setupNext = useCallback(() => {
        const rectWidth = s.el?.getBoundingClientRect().width ?? 0;
        const maxWidth = rectWidth - remsToPixels(0.3) * 2;
        let filledWidth = 0;
        const adv = [];

        do {
            const e = s.all[s.index % s.all.length];
            const img = s.imgByExhibitorId.get(e.id);
            if (!img) break;

            const width = (img.width * uiState.wsImageHeightPx) / img.height + 20;
            if (filledWidth + width > maxWidth && adv.length) break;

            filledWidth += width;
            adv.push({ key: s.keySeq++, e });
            s.index = (s.index + 1) % s.all.length;
        } while (true);

        s.adv = adv;
        s.leftToNextLoad = Math.max(0, s.leftToNextLoad - adv.length);
    }, [s]);

    const loadExhibitorImages = useCallback(async (): Promise<Map<number, HTMLImageElement>> => {
        s.loading = true;
        const batch = s.all.slice(s.index, s.index + s.batchSize).concat(s.all.slice(0, Math.max(0, s.batchSize - s.all.length)));
        const result = await loadImagesInBatchesById(
            new Map(batch.map((x) => [x.id, x.logo]))
        );
        s.leftToNextLoad = result.size;
        s.loading = false;
        return result;
    }, [s]);

    const startInterval = useCallback(() => {
        clearInterval(s.intervalId);
        s.intervalId = window.setInterval(async () => {
            if (s.loading) return;

            if (s.leftToNextLoad <= s.adv.length) {
                s.imgByExhibitorId = await loadExhibitorImages();
            }

            setupNext();
        }, 8000);
    }, [loadExhibitorImages, setupNext]);

    useInit(() => {
        let dispose: IReactionDisposer;
        let isMounted = true;

        (async () => {
            s.all = shuffle(exhibitorStore.advertised);
            s.imgByExhibitorId = await loadExhibitorImages();
            if (!isMounted) return;
            setupNext();
            startInterval();
            uiState.wsStarted = true;
            dispose = reaction(() => uiState.screenSize, setupNext);
        })();

        return () => {
            isMounted = false;
            dispose?.();
            clearInterval(s.intervalId);
        };
    });

    return useObserver(() => (
        <section
            className={classNames("ws")}
            ref={(n) => (s.el = n)}
            onMouseOver={() => clearInterval(s.intervalId)}
            onMouseOut={startInterval}
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
                                store.clickExhibitor(e.e);
                            }}
                        >
                            <img src={e.e.logo} alt={e.e.name} crossOrigin="anonymous" />
                        </a>
                    </CSSTransition>
                ))}
            </TransitionGroup>
        </section>
    ));
});

export default () => useObserver(() => (uiState.wsShown ? <Ws /> : null));
