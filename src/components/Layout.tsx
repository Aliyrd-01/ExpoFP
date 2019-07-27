import React from "react";
import "./Layout.scss";
import Overlay from "./Overlay";
import { observer } from "mobx-react-lite";
import store from "../store";

export default observer(function Layout() {
    // const overlayPosition = "1";
    // const store = useLocalStore(() => ({
    //     overlayPosition: 1,
    //     inc() {
    //         store.overlayPosition += 1;
    //     }
    // }));

    return (
        <div className="layout">
            <div className={`layout__fixed expo-${process.env.REACT_APP_EFP_EXPO} overlay-${store.uiState.overlayPosition}`}>
                <Overlay />
                {/* <LogoOverlay />
                <Ws />
                <Controls />
                <Areas />
                <Overlay />
                <Map v-if="fontsReady && webGlSupported" />
                <Demo />
                <Debug />
                <Pdf v-if="webGlSupported" /> */}
                <div id="fps" />
            </div>
        </div>
    );
});
