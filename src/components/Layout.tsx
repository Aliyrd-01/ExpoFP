import { observer } from "mobx-react-lite";
import React, { Suspense } from "react";

import { useFp, useStore, useUiState, useData } from "../tools/use";
// import store, { uiState } from "../store";
//import settings from "../tools/settings";
import { isWebGlSupported } from "../utils";
// import isDebug from "../utils/is-debug";
import isIframe from "../utils/is-iframe";
import Controls from "./Controls";
import Header from "./Header";
import LargeMessage from "./LargeMessage";
import "./Layout.scss";
import LogoOverlay from "./LogoOverlay";
import Map from "./Map/Map";
import Overlay from "./Overlay";
import Pdf from "./Pdf";
import Ws from "./Ws";

const Demo = React.lazy(() => import(/* webpackChunkName: "demo" */ "./Demo"));
const Free = React.lazy(() => import(/* webpackChunkName: "free" */ "./Free"));
const Debug = React.lazy(() => import(/* webpackChunkName: "debug" */ "./Debug"));

export default observer(function Layout() {
    const store = useStore();
    const uiState = useUiState();
    const data = useData();
    const fp = useFp();

    let freeOrDemo: JSX.Element = null;
    if (fp.eventId === "expo") freeOrDemo = <Demo />;
    else if (data.expoFpAd) freeOrDemo = <Free />;

    return (
        <div className="layout">
            <div className={`layout__fixed expo-${fp.eventId} overlay-${store.uiState.overlayPosition}`}>
                <Header />
                <LogoOverlay />
                <Ws />
                <Controls />
                {/*<Areas />*/}
                {!uiState.noOverlay && <Overlay />}
                {isWebGlSupported && <Map />}
                {freeOrDemo ? <Suspense fallback={null}>{freeOrDemo}</Suspense> : null}
                {__efpDebug ? (
                    <Suspense fallback={null}>
                        <Debug />
                    </Suspense>
                ) : null}
                {isIframe && <LargeMessage />}
                {/* {isIframe && <TouchHover />} */}
                <Pdf />
                <div id="fps" />
            </div>
        </div>
    );
});
