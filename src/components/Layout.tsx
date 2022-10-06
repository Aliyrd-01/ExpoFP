import { observer } from "mobx-react-lite";
import React, { Suspense } from "react";
import data from "../data";
import store, { uiState } from "../store";
import settings from "../tools/settings";
import { isWebGlSupported } from "../utils";
import isDebug from "../utils/is-debug";
import isIframe from "../utils/is-iframe";
import Controls from "./Controls";
import Header from "./Header";
import LargeMessage from "./LargeMessage";
// import TouchHover from "./TouchHover";
import "../styles/index.scss";
import "./Layout.scss";
import Floors from "./Floors";
import LogoOverlay from "./LogoOverlay";
import Map from "./Map/Map";
import Overlay from "./Overlay";
import Pdf from "./Pdf";
// import Demo from "./Demo";
import Ws from "./Ws";
import Share from "./Share";
import Alert from "./Alert";

const Demo = React.lazy(() => import(/* webpackChunkName: "demo" */ "./Demo"));
const Free = React.lazy(() => import(/* webpackChunkName: "free" */ "./Free"));
const Debug = React.lazy(() => import(/* webpackChunkName: "debug" */ "./Debug"));
const Modal = React.lazy(() => import(/* webpackChunkName: "modal" */ "./Modal"));
// const LargeMessage = React.lazy(() => import(/* webpackChunkName: "large-message" */ "./LargeMessage"));

// document.body.addEventListener("touchstart", x => {
//     console.log("body touchstart")
// });

export default observer(function Layout() {
    let freeOrDemo: JSX.Element = null;
    if (settings.EXPO === "expo") freeOrDemo = <Demo />;
    else if (data.expoFpAd) freeOrDemo = <Free />;

    return (
        <div className="layout">
            <div className={`layout__fixed expo-${settings.EXPO} overlay-${store.uiState.overlayPosition}`}>
                <Header />
                <LogoOverlay />
                <Ws />
                <Controls />
                <Floors />
                {/*<Areas />*/}
                {!uiState.noOverlay && <Overlay />}
                {isWebGlSupported && <Map />}
                {freeOrDemo ? <Suspense fallback={null}>{freeOrDemo}</Suspense> : null}
                {isDebug ? (
                    <Suspense fallback={null}>
                        <Debug />
                    </Suspense>
                ) : null}
                {isIframe && <LargeMessage />}
                {/* {isIframe && <TouchHover />} */}
                <Pdf />
                {uiState.modalActive.share ? (
                    <Suspense fallback={null}>
                        <Modal type="share" open={uiState.modalActive.share} onClickClose={() => store.toggleModal("share")}>
                            <Share title={uiState.selectedExhibitor?.name} url={window.location.href} />
                        </Modal>
                    </Suspense>
                ) : null}
                <div id="fps" />
            </div>
        </div>
    );
});
