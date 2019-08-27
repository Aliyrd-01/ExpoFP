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
const Demo = React.lazy(() => import(/* webpackChunkName: "demo" */ "./Demo"));

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

    return (
        <div className="layout">
            <div className={`layout__fixed expo-${process.env.REACT_APP_EFP_EXPO} overlay-${store.uiState.overlayPosition}`}>
                <LogoOverlay />
                <Ws />
                <Controls />
                {/*<Areas />*/}
                <Overlay />
                {fontsReady && isWebGlSupported && <Map />}
                {process.env.REACT_APP_EFP_EXPO === "expo" && (
                    <Suspense fallback={null}>
                        <Demo />
                    </Suspense>
                )}
                {/* <Debug />*/}
                <Pdf />
                <div id="fps" />
            </div>
        </div>
    );
});
