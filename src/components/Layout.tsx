import React from "react";
import "./Layout.scss";
import { observer, useLocalStore } from 'mobx-react-lite';

export default function Layout() {

    const overlayPosition = "1"

    return (
        <div className="layout">
            <div className={`layout__fixed expo-${process.env.REACT_APP_EFP_EXPO} overlay-${overlayPosition}`}>
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
}
