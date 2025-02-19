import { observer } from "mobx-react-lite";
import Alert from "./Alert";
import Button from "./Button";
import React, { Suspense, useEffect, useState } from "react";
import store from "../store";
import { t } from "../utils/i18n";
import { reaction } from "mobx";
import Modal from "./Modal";

const MODAL_SHOWN_KEY = "kiosk_setup_modal_shown";

const KioskSetup = observer(() => {
    const [showGuide, setShowGuide] = useState(false);
    const [showError, setShowError] = useState(false);

    reaction(
        () => store.uiState.kioskSetup,
        (kioskSetup) => {
            if (store.uiState.kiosk && kioskSetup) {
                store.uiState.kiosk = false;
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
            if (!kioskSetupData) {
                return;
            }
            store.routeStore.selectCurrentPosition(kioskSetupData, false, 0, false);
        },
    );

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

        // TODO: Do we need to save the kiosk position to the database?
        new Promise((resolve) => {
            resolve(undefined);
        }).then(() => {
            const { x, y, z } = store.uiState.kioskSetupData;

            const params = new URLSearchParams(window.location.search);
            params.delete("kiosk_setup");
            params.set("kiosk_id", `${x}_${y}_${z}`);
            window.history.pushState({}, "", `?${params.toString()}`);

            store.uiState.kioskSetup = false;
            store.uiState.kiosk = true;
        }).catch(() => {
            setShowError(true);
        });
    };

    const exit = () => {
        store.uiState.kioskSetup = false;
        store.uiState.kioskSetupData = null;
        sessionStorage.removeItem(MODAL_SHOWN_KEY);
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
