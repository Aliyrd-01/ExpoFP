import { observer } from "mobx-react-lite";
import React, { useEffect, useState, Suspense } from "react";
import store from "../store";
import logger from "../tools/logger";
import { isWebGlSupported } from "../utils";
import "./Layout.scss";
import LogoOverlay from "./LogoOverlay";
import Map from "./Map/Map";
import Overlay from "./Overlay";
// import Demo from "./Demo";
import Ws from "./Ws";
import Controls from "./Controls";
import Pdf from "./Pdf";
import data from "../data";
const Demo = React.lazy(() => import(/* webpackChunkName: "demo" */ "./Demo"));
const Free = React.lazy(() => import(/* webpackChunkName: "free" */ "./Free"));

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
    useEffect(() => {
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
                {/* <Debug />*/}
                <Pdf />
                <div id="fps" />
            </div>
        </div>
    );
});
