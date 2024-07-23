import { observer } from "mobx-react-lite";
import React, { Suspense, useEffect, useState } from "react";
import cn from "classnames";
import data from "../data";
import store, { layersStore, uiState, heatmapStore } from "../store";
import settings from "../tools/settings";
import { isWebGlSupported, remsToPixels } from "../utils";
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
import { checkUserIsGDPR, hasUserConsent, setConsentSettings, setCookieConsent } from "../tools/gtag";
import HeatmapLegend from "./HeatmapLegend";

const Demo = React.lazy(() => import(/* webpackChunkName: "demo" */ "./Demo"));
const Free = React.lazy(() => import(/* webpackChunkName: "free" */ "./Free"));
const Debug = React.lazy(() => import(/* webpackChunkName: "debug" */ "./Debug"));
const Mapbox = React.lazy(() => import(/* webpackChunkName: "mapbox" */ "./Mapbox/Mapbox"));
const ThreeComponent = React.lazy(() => import(/* webpackChunkName: "mapbox" */ "./Threejs/ThreeComponent"));
const Modal = React.lazy(() => import("./Modal"));
const CookieConsent = React.lazy(() => import(/* webpackChunkName: "cc-script" */ "./CookieConsent"));
// const LargeMessage = React.lazy(() => import(/* webpackChunkName: "large-message" */ "./LargeMessage"));

// document.body.addEventListener("touchstart", x => {
//     console.log("body touchstart")
// });

interface LayoutProps {
    offHistory: boolean;
    allowConsent?: boolean;
}

export default observer(function Layout({ offHistory, allowConsent }: LayoutProps) {
    const [isGDPR, setIsGDPR] = useState(false);

    let freeOrDemo: JSX.Element = null;
    if (settings.EXPO === "expo") freeOrDemo = <Demo />;
    else if (data.expoFpAd) freeOrDemo = <Free />;

    const acceptConsent = () => {
        setCookieConsent(true);
        setConsentSettings();
        store.uiState.hideCookieConsent = true;
    };

    const rejectConsent = () => {
        setCookieConsent(false);
        setConsentSettings();
        store.uiState.hideCookieConsent = true;
    };

    useEffect(() => {
        async function checkConsent() {
            const consentResult = await checkUserIsGDPR();
            if (consentResult || consentResult === null) {
                setIsGDPR(true);
            } else {
                setIsGDPR(false);
            }
        }

        if (!Boolean(hasUserConsent(allowConsent))) {
            checkConsent();
        } else {
            setIsGDPR(true);
        }
    }, []);

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
                {!uiState.hideHeaderLogo && <Ws />}
                <Controls />
                {uiState.kiosk && uiState.inIdle && <TouchHand />}
                {/* <Layers /> */}
                {/*<Areas />*/}
                {layersStore.mode == LayersMode.Radio && <Floors />}
                {!uiState.noOverlay && <Overlay isGDPR={isGDPR} allowConsent={allowConsent} />}
                {isWebGlSupported && <Map />}
                {store.mapboxStore.mapBoxActivated && store.mapboxStore.mapBoxEnabled && (
                    <Suspense fallback={<MapLoader />}>
                        {fpGeo?.properties?.mode === "threejs" ? (
                            <ThreeComponent isMapbox={store.mapboxStore.isMapbox} expo={settings.EXPO} />
                        ) : (
                            <Mapbox />
                        )}
                    </Suspense>
                )}
                {freeOrDemo ? <Suspense fallback={null}>{freeOrDemo}</Suspense> : null}
                {!uiState.hideCookieConsent && !uiState.kiosk && isGDPR && allowConsent === undefined && (
                    <Suspense fallback={null}>
                        <CookieConsent
                            link="https://expofp.com/pages/viewer-cookie-consent"
                            onClickAccept={acceptConsent}
                            onClickReject={rejectConsent}
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
                            <Share
                                title={uiState.selectedExhibitor?.name}
                                url={
                                    offHistory
                                        ? `${window.location.origin}?${encodeURI(uiState.selectedExhibitor.slug)}`
                                        : window.location.href
                                }
                            />
                        </Modal>
                    </Suspense>
                ) : null}
                {uiState.heatmap ? (
                    <HeatmapLegend
                        style={{
                            left: `calc(50% + ${store.uiState.mapVisibleStart / 2}px)`,
                            top: uiState.overlayPosition === "bottom" ? uiState.mapVisibleTop + remsToPixels(0.7) + "px" : null,
                            bottom: uiState.overlayPosition === "bottom" ? null : "30px",
                        }}
                        className={uiState.responsiveClass}
                        max={heatmapStore.minAndMaxClicks.max}
                        min={heatmapStore.minAndMaxClicks.min}
                        colors={settings.heatmapColors}
                    />
                ) : null}
                <LayersLoading active={!layersStore.layersLoaded} />
                <div id="fps" />
            </div>
        </div>
    );
});
