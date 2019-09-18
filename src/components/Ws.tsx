import { reaction } from "mobx";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import store, { exhibitorStore, uiState } from "../store";
import { Exhibitor } from "../store/ExhibitorStore";
import { remsToPixels, shuffle } from "../utils";
import { useInit } from "../utils/mobx";
import "./Ws.scss";

function Ws() {
    const s = useLocalStore(() => ({
        el: null as HTMLElement,
        all: [] as Exhibitor[],
        adv: [] as { key: number; e: Exhibitor }[],
        keySeq: 0,
        index: 0,
        imgByExhbitorId: null as Map<number, HTMLImageElement>,
        intervalId: 0,
        get sectionStyle() {
            const style = {
                width: uiState.overlayPosition === "left" ? `${uiState.wsWidthPx}px` : "100%",
                // todo: remove
                opacity: uiState.wsStarted ? 1 : 0,
                right: 0,
                padding: `0 ${uiState.wsPaddingPx}px`
            } as any;

            if (uiState.wsPosition === "top") style.top = 0;
            else style.bottom = 0;
            return style;
        }
    }));

    useInit(() => {
        (async function() {
            s.all = shuffle(exhibitorStore.advertised);
            s.imgByExhbitorId = await loadExhbibitorImages();
            setupNext();
            mouseout();
            uiState.wsStarted = true;

            reaction(() => uiState.screenSize, setupNext);
        })();
    });

    return useObserver(() => (
        <section className="ws" ref={n => (s.el = n)} onMouseOver={mouseover} onMouseOut={mouseout} style={s.sectionStyle}>
            <TransitionGroup component={null}>
                {s.adv.map(e => (
                    <CSSTransition key={e.key} timeout={500}>
                        <a
                            href={`?${e.e.slug}`}
                            className="ws__exhibitor"
                            style={{ height: `${uiState.wsImageHeightPx}px` }}
                            onClick={x => {
                                x.preventDefault();
                                select(e.e);
                            }}
                        >
                            <img src={e.e.logo} alt={e.e.name} />
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
            const img = s.imgByExhbitorId.get(e.id);
            const width = (img.width * uiState.wsImageHeightPx) / img.height + 20; //padding

            if (filledWidth + width > maxWidth && adv.length) break;

            filledWidth += width;
            adv.push({ key: s.keySeq++, e });
            s.index++;
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
        s.intervalId = window.setInterval(setupNext, 8000);
    }

    async function loadExhbibitorImages(): Promise<Map<number, HTMLImageElement>> {
        const result = new Map<number, HTMLImageElement>();
        return new Promise((resolve, reject) => {
            s.all.forEach(x => {
                const img = new Image();
                img.onload = () => {
                    result.set(x.id, img);
                    if (result.size === s.all.length) {
                        resolve(result);
                    }
                };
                img.src = x.logo;
            });
        });
    }
}

export default () => useObserver(() => <>{uiState.wsShown ? <Ws /> : null}</>);
