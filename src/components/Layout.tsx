import { observer } from "mobx-react-lite";
import React, { Suspense, useLayoutEffect, useState } from "react";
import data from "../data";
import store, { uiState } from "../store";
import logger from "../tools/logger";
import { isWebGlSupported } from "../utils";
import Controls from "./Controls";
import "./Layout.scss";
import LogoOverlay from "./LogoOverlay";
import Map from "./Map/Map";
import Overlay from "./Overlay";
import Pdf from "./Pdf";
// import Demo from "./Demo";
import Ws from "./Ws";
import settings from "../tools/settings";
const Demo = React.lazy(() => import(/* webpackChunkName: "demo" */ "./Demo"));
const Free = React.lazy(() => import(/* webpackChunkName: "free" */ "./Free"));
const Debug = React.lazy(() => import(/* webpackChunkName: "debug" */ "./Debug"));
const LargeMessage = React.lazy(() => import(/* webpackChunkName: "large-message" */ "./LargeMessage"));

export default observer(function Layout() {
    // const overlayPosition = "1";
    // const store = useLocalStore(() => ({
    //     overlayPosition: 1,
    //     inc() {
    //         store.overlayPosition += 1;
    //     }
    // }));
    const [fontsReady, setFontsReady] = useState(false);
    // const [Demo, setDemo] = useState(null);

    // use useLayoutEffect because it seems that f.ready worked bad otherwise
    useLayoutEffect(() => {
        let set = false;
        function doSet(cause) {
            if (set) return;
            set = true;
            logger.log("fontsReady", cause);
            setFontsReady(true);
        }

        window.setTimeout(doSet.bind(window, "timeout"), 5000);
        window.addEventListener("load", doSet.bind(window, "load"));
        const f = document["fonts"];
        // never seen when next line worked, but anyway
        if (f && f.addEventListener) f.addEventListener("onloadingdone", doSet.bind(window, "onloadingdone"));
        if (f && f.ready) f.ready.then(doSet.bind(window, "ready"));
    }, []);

    let freeOrDemo: JSX.Element = null;
    if (process.env.REACT_APP_EFP_EXPO === "expo") freeOrDemo = <Demo />;
    else if (data.free) freeOrDemo = <Free />;

    return (
        <div className="layout">
            <div className={`layout__fixed expo-${process.env.REACT_APP_EFP_EXPO} overlay-${store.uiState.overlayPosition}`}>
                <LogoOverlay />
                <Ws />
                <Controls />
                {/*<Areas />*/}
                <Overlay />
                {fontsReady && isWebGlSupported && <Map />}
                {freeOrDemo ? <Suspense fallback={null}>{freeOrDemo}</Suspense> : null}
                {settings.debug ? (
                    <Suspense fallback={null}>
                        <Debug />
                    </Suspense>
                ) : null}
                {uiState.largeMessage ? (
                    <Suspense fallback={null}>
                        <LargeMessage />
                    </Suspense>
                ) : null}
                <Pdf />
                <div id="fps" />
            </div>
        </div>
    );
});
