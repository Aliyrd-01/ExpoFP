import { observer } from "mobx-react-lite";
import Alert from "./Alert";
import Button from "./Button";
import React, { Suspense, useEffect, useState } from "react";
import store from "../store";
import { t } from "../utils/i18n";
import { reaction } from "mobx";
import Modal from "./Modal";
import { sublines } from "../utils/wayfinding";
import { SpecialBooth } from "../store/BoothStore";
import Rect from "../core/Rect";
import { strEqual } from "../utils/strEqual";
import { KIOSK_ID_KEY, KIOSK_SETUP_KEY } from "../constants";

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
            const hasIndex = index !== -1;

            if (!kioskSetupData) {
                if (hasIndex) {
                    store.boothStore.booths.splice(index, 1);
                }
                return;
            }

            const nearestRouteLine = findNearestRouteLine(kioskSetupData);
            const closestPoint = findClosestPointOnLine(kioskSetupData, nearestRouteLine);

            if (!closestPoint) {
                if (hasIndex) {
                    store.boothStore.booths.splice(index, 1);
                }
                return;
            }

            const booth = new SpecialBooth() as MutableRequired<SpecialBooth>;
            booth.id = Number.MAX_SAFE_INTEGER;
            booth.name = name;
            booth.exhibitors = [];
            booth.rect = Rect.fromX1y1x2y2(
                kioskSetupData.x,
                kioskSetupData.y,
                closestPoint.x,
                closestPoint.y,
            );
            booth.layer = store.layerStore.findLayer(kioskSetupData.z);

            if (hasIndex) {
                store.boothStore.booths.splice(index, 1, booth as SpecialBooth);
            } else {
                store.boothStore.booths.push(booth as SpecialBooth);
            }       
        },
    );

    useEffect(() => {
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

        params.set(KIOSK_ID_KEY, encodeKioskId(store.uiState.kioskSetupData));
        window.history.pushState({}, "", `?${params.toString()}`);

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

function encodeKioskId(data: { x: number; y: number; z: string }): string {
    const { x, y, z } = data || {};
    return `${x}_${y}_${z}`;
}

function decodeKioskId(id: string): { x: number; y: number; z: string } {
    const kioskId = id.split("_") || [];
    return {
        x: parseFloat(kioskId[0]),
        y: parseFloat(kioskId[1]),
        z: kioskId[2],
    };
}

function findNearestRouteLine(point) {
    const lines = sublines()?.lines || [];
    const levelLines = lines.filter((l) => l.p0.layer === point.z || l.p1.layer === point.z);

    let minDistance = Infinity;
    let closestLine = null;

    levelLines.forEach(line => {
        const distance = distanceToLine(point, line.p0, line.p1);
        if (distance < minDistance) {
            minDistance = distance;
            closestLine = line;
        }
    });

    return closestLine;
}

function distanceToLine(point, p0, p1) {
    const x = point.x;
    const y = point.y;
    const x1 = p0.x;
    const y1 = p0.y;
    const x2 = p1.x;
    const y2 = p1.y;

    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) {
        param = dot / len_sq;
    }

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

function findClosestPointOnLine(point, line) {
    const { x: x1, y: y1 } = line.p0;
    const { x: x2, y: y2 } = line.p1;
    const { x, y } = point;

    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;

    if (len_sq !== 0) {
        param = dot / len_sq;
    }

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    return { x: xx, y: yy };
}
