import React, { createRef, RefObject, useCallback } from "react";
import classNames from "classnames";
import { IReactionDisposer, reaction } from "mobx";
import { useLocalStore, useObserver } from "mobx-react-lite";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import store, { exhibitorStore, uiState } from "../store";
import { Exhibitor } from "../store/ExhibitorStore";
import { remsToPixels, shuffle } from "../utils";
import { useInit } from "../utils/mobx";
import { ImageUrls, loadImagesInBatchesById } from "../utils/loadImagesInBatches";

import "./Ws.scss";

const DELAY = 8000;

const Ws = React.memo(() => {
    const s = useLocalStore(() => ({
        el: null as HTMLElement | null,
        all: [] as Exhibitor[],
        adv: [] as { key: number; e: Exhibitor; nodeRef: RefObject<HTMLAnchorElement> }[],
        keySeq: 0,
        index: 0,
        imgByExhibitorId: new Map<number, HTMLImageElement>(),
        batchSize: 100,
        loading: false,
        leftToNextLoad: 0,
        timeoutId: 0,
        get sectionStyle(): Record<string, string | number> {
            const { overlayPosition, wsWidthPx, wsStarted, wsPaddingPx, wsPosition, headerHeightPx } = uiState;

            const isLeft = overlayPosition === "left";
            const isTop = wsPosition === "top";

            const style: Record<string, string | number> = {
                right: isLeft ? "10px" : "0",
                width: isLeft ? `${wsWidthPx - 30}px` : "100%",
                opacity: wsStarted ? 1 : 0,
                padding: `0 ${wsPaddingPx}px`,
            };

            if (isTop) {
                style.top = isLeft ? `${headerHeightPx + 10}px` : 0;
            } else {
                style.bottom = isLeft ? "10px" : 0;
            }

            return style;
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

        s.adv = adv.map((x) => ({ ...x, nodeRef: createRef() }));
        s.leftToNextLoad = Math.max(0, s.leftToNextLoad - adv.length);
    }, [s]);

    const loadExhibitorImages = useCallback(async (): Promise<Map<number, HTMLImageElement>> => {
        s.loading = true;

        let batch = s.all.slice(s.index, s.index + s.batchSize);
        if (batch.length < s.batchSize) {
            batch = batch.concat(s.all.slice(0, s.batchSize - batch.length));
        }

        const result = await loadImagesInBatchesById(new Map<number, ImageUrls>(batch.map((x) => [x.id, { fallback: x.logo }])));
        s.leftToNextLoad = result.size;
        s.loading = false;
        return result;
    }, [s]);

    const startTimer = useCallback(() => {
        const fn = async () => {
            if (s.loading) {
                s.timeoutId = window.setTimeout(fn, DELAY);
                return;
            }

            if (s.leftToNextLoad <= s.adv.length) {
                s.imgByExhibitorId = await loadExhibitorImages();
            }

            setupNext();
            s.timeoutId = window.setTimeout(fn, DELAY);
        };

        clearTimeout(s.timeoutId);
        s.timeoutId = window.setTimeout(fn, DELAY);
    }, [loadExhibitorImages, setupNext]);

    useInit(() => {
        let dispose: IReactionDisposer;
        let isMounted = true;

        (async () => {
            s.all = shuffle(exhibitorStore.advertised);
            s.imgByExhibitorId = await loadExhibitorImages();
            if (!isMounted) return;
            setupNext();
            startTimer();
            uiState.wsStarted = true;
            dispose = reaction(() => uiState.screenSize, setupNext);
        })();

        return () => {
            isMounted = false;
            dispose?.();
            clearInterval(s.timeoutId);
        };
    });

    return useObserver(() => (
        <section
            className={classNames("ws")}
            ref={(n) => (s.el = n)}
            onMouseOver={() => clearInterval(s.timeoutId)}
            onMouseOut={startTimer}
            style={s.sectionStyle}
        >
            <TransitionGroup component={null}>
                {s.adv.map((e) => (
                    <CSSTransition key={e.key} timeout={500} nodeRef={e.nodeRef}>
                        <a
                            ref={e.nodeRef}
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
