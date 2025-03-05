import { observer } from "mobx-react-lite";
import Alert from "./Alert";
import Button from "./Button";
import React, { Suspense, useEffect, useState } from "react";
import store from "../store";
import { t } from "../utils/i18n";
import { reaction } from "mobx";
import Modal from "./Modal";
import { strEqual } from "../utils/strEqual";
import { KIOSK_ID_KEY, KIOSK_SETUP_KEY } from "../constants";
import { CurrentPosition } from "../store/RouteStore";
import { RouteCutIn } from "../RouteCutIn";

const MODAL_SHOWN_KEY = "kiosk_setup_modal_shown";

const KioskSetup = observer(() => {
    const [showGuide, setShowGuide] = useState(false);
    const [showError, setShowError] = useState(false);

    reaction(
        () => store.uiState.kioskSetup,
        (kioskSetup) => {
            if (kioskSetup) {
                store.uiState.kiosk = true;
            }

            store.uiState.hideOverlay = kioskSetup;
            store.uiState.hideHeaderLogo = kioskSetup;
            store.uiState.hideLogoInBooth = kioskSetup;
            store.uiState.monochrome = kioskSetup;
        },
    );

    reaction(
        () => store.uiState.kioskSetupData,
        (kioskSetupData) => {
            const name = "Interactive Kiosk";

            const index = store.boothStore.booths.findIndex(b => strEqual(b.name, name));
            if (index !== -1) {
                store.boothStore.booths.splice(index, 1);
            }

            if (!kioskSetupData) {
                return;
            }

            const booth = new RouteCutIn(
                Date.now(),
                "Interactive Kiosk",
                {
                    x: store.uiState.kioskSetupData.x,
                    y: store.uiState.kioskSetupData.y,
                    layer: store.uiState.kioskSetupData.z.toString(),
                },
            );
            store.boothStore.booths.push(booth);
            store.routeStore.defaultFrom = booth;
        },
    );

    useEffect(() => {
        function decodeKioskId(id: string): { x: number; y: number; z: string } {
            const kioskId = id.split("_") || [];
            return {
                x: parseFloat(kioskId[0]),
                y: parseFloat(kioskId[1]),
                z: kioskId[2],
            };
        }

        const searchParams = new URLSearchParams(decodeURIComponent(window.location.search));

        if (searchParams.has(KIOSK_SETUP_KEY)) {
            const kioskSetup = searchParams.get(KIOSK_SETUP_KEY);
            if (kioskSetup) {
                store.uiState.kioskSetupData = decodeKioskId(kioskSetup);
            }
            store.uiState.kioskSetup = true;
        }

        const kioskId = searchParams.get(KIOSK_ID_KEY);
        if (kioskId) {
            store.uiState.kioskSetupData = decodeKioskId(kioskId);
        }
    }, []);

    useEffect(() => {
        if (!store.uiState.kioskSetup) {
            return;
        }

        if (!sessionStorage.getItem(MODAL_SHOWN_KEY)) {
            setShowGuide(true);
        }

        const originalOnGetCoordsClick = store.fp.onGetCoordsClick;
        store.fp.onGetCoordsClick = coords => {
            originalOnGetCoordsClick?.(coords);

            setShowError(false);
            store.uiState.kioskSetupData = { ...coords };
        };

        return () => {
            store.fp.onGetCoordsClick = originalOnGetCoordsClick;
            setShowError(false);
        }
    }, [store.uiState.kioskSetup, store.fp.onGetCoordsClick]);

    const save = () => {
        setShowError(false);

        const params = new URLSearchParams(decodeURIComponent(window.location.search));
        params.delete(KIOSK_SETUP_KEY);

        function encodeKioskId(data: CurrentPosition): string {
            const { x, y, z } = data || {};
            return `${x}_${y}_${z}`;
        }

        params.set(KIOSK_ID_KEY, encodeKioskId(store.uiState.kioskSetupData));
        window.history.replaceState({}, "", `?${params.toString()}`);

        store.uiState.kioskSetup = false;
        store.uiState.kiosk = true;
    };

    const exit = () => {
        store.uiState.kioskSetup = false;
        sessionStorage.removeItem(MODAL_SHOWN_KEY);

        const params = new URLSearchParams(decodeURIComponent(window.location.search));

        const kioskId = params.get(KIOSK_SETUP_KEY);
        if (kioskId) {
            params.set(KIOSK_ID_KEY, kioskId);
        } else {
            store.uiState.kioskSetupData = null;
        }

        params.delete(KIOSK_SETUP_KEY);
        window.history.replaceState({}, "", `?${params.toString()}`);
    };

    return store.uiState.kioskSetup && (
        <Suspense fallback={null}>
            <Modal open={showGuide} onClickClose={() => setShowGuide(false)}>
                <h2>{t("Setting up the kiosk")}</h2>

                <p>{t("Click on the desired location on the map where the kiosk should be placed.")}</p>
                <p>{t("The coordinates will be set automatically, and the kiosk will appear at the selected point.")}</p>
                <p>{t("If needed, adjust the position by clicking on a different location on the map.")}</p>

                <div style={{ textAlign: "right" }}>
                    <Button
                        inline
                        text={t("Ok, got it.")}
                        onClick={() => {
                            sessionStorage.setItem(MODAL_SHOWN_KEY, "1");
                            setShowGuide(false);
                        }}
                    />
                </div>
            </Modal>

            {!showGuide && (<div style={{
                position: "fixed",
                bottom: "1rem",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 9998,
            }}>
                <Alert
                    variant="blank"
                    title={t("Setting the position of this kiosk")}
                    inline
                    showIcon={false}
                >
                    <div
                        style={{
                            display: "grid",
                            gridAutoFlow: "column",
                            gap: "0.5rem",
                            paddingTop: "1rem",
                        }}
                    >
                        <Button 
                            inline 
                            size="sm" 
                            text={t("Save")} 
                            disabled={!store.uiState.kioskSetupData} 
                            onClick={save}
                        />

                        <Button 
                            variant="gray" 
                            size="sm" 
                            inline
                            text={t("Exit")}
                            onClick={exit}
                        />
                    </div>
                </Alert>
            </div>)}

            {showError && (
                <div style={{
                    position: "fixed",
                    top: "1rem",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 9999,
                }}>
                    <Alert
                        variant="error"
                        closable
                        title={t("Error")}
                        inline
                        onClose={() => setShowError(false)}
                    >
                        {t("An error occurred while setting the kiosk position.\nPlease try again.")}
                    </Alert>
                </div>
            )}
        </Suspense>
    );
});

export default KioskSetup;
