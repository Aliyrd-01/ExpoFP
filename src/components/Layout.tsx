import React, { useEffect, useState } from "react";
import "./Layout.scss";
import Overlay from "./Overlay";
import { observer } from "mobx-react-lite";
import store from "../store";
import logger from "../tools/logger";
import { isWebGlSupported } from "../utils";
import Map from "./Map/Map";

export default observer(function Layout() {
    // const overlayPosition = "1";
    // const store = useLocalStore(() => ({
    //     overlayPosition: 1,
    //     inc() {
    //         store.overlayPosition += 1;
    //     }
    // }));
    const [fontsReady, setFontsReady] = useState(false);
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
                <Overlay />
                {/* <LogoOverlay />
                <Ws />
                <Controls />
                <Areas />
                <Overlay /> */}
                {fontsReady && isWebGlSupported && <Map />}
                {/* <Demo />
                <Debug />
                <Pdf v-if="webGlSupported" /> */}
                <div id="fps" />
            </div>
        </div>
    );
});
