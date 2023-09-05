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
import LayersLoading from "./LayersLoading";
import { fpGeo } from "./Mapbox/utils/fpGeo";
import { destroyGtag, initializeGtag, setConsentSettings } from "../tools/gtag";

const Demo = React.lazy(() => import(/* webpackChunkName: "demo" */ "./Demo"));
const Free = React.lazy(() => import(/* webpackChunkName: "free" */ "./Free"));
const Debug = React.lazy(() => import(/* webpackChunkName: "debug" */ "./Debug"));
const Mapbox = React.lazy(() => import(/* webpackChunkName: "mapbox" */ "./Mapbox/Mapbox"));
const ThreeComponent = React.lazy(() => import(/* webpackChunkName: "mapbox" */ "./Threejs/ThreeComponent"));
const Modal = React.lazy(() => import("./Modal"));
const CookieConsent = React.lazy(() => import(/* webpackChunkName: "cookie-consent" */ "./CookieConsent"));
// const LargeMessage = React.lazy(() => import(/* webpackChunkName: "large-message" */ "./LargeMessage"));

// document.body.addEventListener("touchstart", x => {
//     console.log("body touchstart")
// });

interface LayoutProps {
    allowConsent?: boolean;
}

export default observer(function Layout({ allowConsent }: LayoutProps) {
    let freeOrDemo: JSX.Element = null;
    if (settings.EXPO === "expo") freeOrDemo = <Demo />;
    else if (data.expoFpAd) freeOrDemo = <Free />;

    const onCookieConcentAccept = () => {
        localStorage.setItem("userCookieChoice", "true");
        initializeGtag(allowConsent);
        setConsentSettings();
        store.uiState.hideCookieConsent = true;
    };

    const onCookieConcentReject = () => {
        localStorage.setItem("userCookieChoice", "false");
        store.uiState.hideCookieConsent = true;
        setConsentSettings();
    };

    return (
        <div
            className={cn("layout", {
                "efp-kiosk": uiState.kiosk,
                "efp-layers-mode": store.layerStore.mode,
                "efp-ws-mode": uiState.wsShown,
            })}
            dir={uiState.rtl ? "rtl" : "ltr"}
        >
            <div className={`layout__fixed expo-${settings.EXPO} overlay-${store.uiState.overlayPosition}`}>
                <Header />
                {/*{!data.hideLogoOverlay && <LogoOverlay />}*/}
                <LogoOverlay />
                <Ws />
                <Controls />
                {settings.EXPO === "exhibitorlive2023" && uiState.kiosk && uiState.inIdle && <TouchHand />}
                {/* <Layers /> */}
                {/*<Areas />*/}
                {layersStore.mode == LayersMode.Radio && <Floors />}
                {!uiState.noOverlay && <Overlay />}
                {isWebGlSupported && <Map />}
                {store.mapboxStore.mapBoxActivated && store.mapboxStore.mapBoxEnabled && (
                    <Suspense fallback={<MapLoader />}>
                        {fpGeo?.properties?.mode === "threejs" ? (
                            <ThreeComponent isMapbox={true} expo={settings.EXPO} />
                        ) : (
                            <Mapbox />
                        )}
                    </Suspense>
                )}
                {freeOrDemo ? <Suspense fallback={null}>{freeOrDemo}</Suspense> : null}
                {!store.uiState.hideCookieConsent && allowConsent === undefined && (
                    <Suspense fallback={null}>
                        <CookieConsent
                            link="https://expofp.com"
                            onClickAccept={onCookieConcentAccept}
                            onClickReject={onCookieConcentReject}
                        />
                    </Suspense>
                )}
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
                <LayersLoading active={!layersStore.layersLoaded} />
                <div id="fps" />
            </div>
        </div>
    );
});
