import { observer } from "mobx-react-lite";
import React, { Suspense } from "react";
import cn from "classnames";
import data from "../data";
import store, { layersStore, uiState } from "../store";
import settings from "../tools/settings";
import { isWebGlSupported } from "../utils";
import isDebug from "../utils/is-debug";
import isIframe from "../utils/is-iframe";
import Controls from "./Controls";
import Floors from "./Floors";
import Header from "./Header";
import LargeMessage from "./LargeMessage";
import "../styles/index.scss";
import "./Layout.scss";
import LogoOverlay from "./LogoOverlay";
import Map from "./Map/Map";
import { MapLoader } from "./Mapbox/MapLoader";
import Overlay from "./Overlay";
import Pdf from "./Pdf";
import Share from "./Share";
import Ws from "./Ws";
import { LayersMode } from "../store/LayerStore";
import TouchHand from "./TouchHand";

const Demo = React.lazy(() => import(/* webpackChunkName: "demo" */ "./Demo"));
const Free = React.lazy(() => import(/* webpackChunkName: "free" */ "./Free"));
const Debug = React.lazy(() => import(/* webpackChunkName: "debug" */ "./Debug"));
const Mapbox = React.lazy(() => import(/* webpackChunkName: "mapbox" */ "./Mapbox/Mapbox"));
const Modal = React.lazy(() => import("./Modal"));
// const LargeMessage = React.lazy(() => import(/* webpackChunkName: "large-message" */ "./LargeMessage"));

// document.body.addEventListener("touchstart", x => {
//     console.log("body touchstart")
// });

export default observer(function Layout() {
    let freeOrDemo: JSX.Element = null;
    if (settings.EXPO === "expo") freeOrDemo = <Demo />;
    else if (data.expoFpAd) freeOrDemo = <Free />;

    return (
        <div
            className={cn("layout", {
                "efp-kiosk": uiState.kiosk,
                "efp-layers-mode": store.layerStore.mode,
                "efp-ws-mode": uiState.wsShown,
            })}
        >
            <div className={`layout__fixed expo-${settings.EXPO} overlay-${store.uiState.overlayPosition}`}>
                <Header />
                {!data.hideLogoOverlay && <LogoOverlay />}
                <Ws />
                <Controls />
                {uiState.kiosk && uiState.inIdle && <TouchHand />}
                {/* <Layers /> */}
                {/*<Areas />*/}
                {layersStore.mode == LayersMode.Radio && <Floors />}
                {!uiState.noOverlay && <Overlay />}
                {isWebGlSupported && <Map />}
                {store.mapboxStore.mapBoxActivated && store.mapboxStore.mapBoxEnabled && (
                    <Suspense fallback={<MapLoader />}>
                        <Mapbox />
                    </Suspense>
                )}
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
