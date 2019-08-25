import React, { FocusEvent, KeyboardEvent, useEffect, useRef, useState, useCallback } from "react";
import { useObserver } from "mobx-react-lite";
import { uiState, exhibitorStore } from "../store";
import { shuffle, remsToPixels } from "../utils";
import { Exhibitor } from "../store/ExhibitorStore";
import { autorun, reaction } from "mobx";

function Ws() {
    const el = useRef();
    // const s = us
    const [i, setI] = useState(0);
    const [all, setAll] = useState<Exhibitor[]>();
    const [adv, setAdv] = useState<Exhibitor[]>();
    const [rectWidth, setRectWidth] = useState<number>();
    const [imgByExhbitorId, setImgByExhibitorId] = useState<Map<number, HTMLImageElement>>();

    // set all and map
    useEffect(() => {
        (async function() {
            const all = shuffle(exhibitorStore.advertised);;
            const imgByExhbitorId = await loadExhbibitorImages(all);
            setAll(all);
            setImgByExhibitorId(imgByExhbitorId);
        })();
    }, []);

    // set width initially and when screen changes
    useEffect(() => {
        function set(){
            setRectWidth((el.current as HTMLDivElement).getBoundingClientRect().width)
        }
        set();
        return reaction(()=> uiState.screenSize, set);
    }, [el.current]);

    const setupNext = useCallback(()=>{
        const maxWidth = rectWidth - remsToPixels(0.3) * 2; // exclude padding
        let filledWidth = 0;
        const adv = [];
        let key = 0;
        let index = i;
        do {
            const e = all[index % adv.length];
            const img = imgByExhbitorId.get(e.id);
            const width = img.width * uiState.wsImageHeightPx / img.height + 20; //padding

            if (filledWidth + width > maxWidth && adv.length) break;

            filledWidth += width;
            adv.push({ key: keySeq++, e: e });
            this.index++;

        } while (true)
        this.adv = adv;
        if (!this.wsStarted) store.commit("setWsStarted", true);
    }, [i, rectWidth, adv, imgByExhbitorId, el.current]);

    return useObserver(() => <section className="ws" ref={el} />);

    function setupNext(){
        //const rectWidth = (el.current as HTMLTableSectionElement).getBoundingClientRect().width;
            const maxWidth = rectWidth - remsToPixels(0.3) * 2; // exclude padding
            let filledWidth = 0;
            const adv = [];
            let key = 0;
            do {
                const e = all[this.index % this.loadedAdv.length];
                const img = imgByExhibitorId.get(e.id);
                const width = img.width * this.wsImageHeightPx / img.height + 20; //padding

                if (filledWidth + width > maxWidth && adv.length) break;

                filledWidth += width;
                adv.push({ key: keySeq++, e: e });
                this.index++;

            } while (true)
            this.adv = adv;
            if (!this.wsStarted) store.commit("setWsStarted", true);
    }
}

async function loadExhbibitorImages(all: Exhibitor[]): Promise<Map<number, HTMLImageElement>> {
    const result = new Map<number, HTMLImageElement>();
    return new Promise((resolve, reject) => {
        all.forEach(x => {
            const img = new Image();
            img.onload = () => {
                result.set(x.id, img);
                if (result.size === all.length) {
                    // this.loadedAdv = this.all;
                    // this.$watch("screenSize", this.setupNext);
                    // this.mouseout();
                    // intervaId = window.setInterval(this.setupNext, 5000);
                    // this.setupNext();
                    resolve(result);
                }
            };
            img.src = x.logo;
        });
    });
}
export default () => useObserver(() => <>{uiState.wsShown ? <Ws /> : null}</>);
