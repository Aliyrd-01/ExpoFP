import React, { useEffect, useState } from "react";
import "./OverlayParticles.scss";
import { observer } from "mobx-react-lite";
import store from "../store";

function OverlayParticles() {
    const [visible, setVisible] = useState(false);
    const [starting, setStarting] = useState(false);
    const [particles, setParticles] = useState();

    function canShow() {
        return store.uiState.overlayPosition === "left";
    }

    function stop() {
        setStarting(false);
        if (particles) {
            particles.destroy();
            setParticles(null);
        }
    }

    useEffect(() => {
        if (!canShow()) {
            stop();
            return;
        }
        setStarting(true);

        // btw, we do not want it immediately - it can be broken sometimes
        waitFor(
            () => window["Particles"],
            Particles => {
                if (!starting) return;
                setVisible(true);

                const particles = Particles.init({
                    selector: ".overlay__particles",
                    maxParticles: 50,
                    speed: 0.4,
                    sizeVariations: 4,
                    color: "#557988",
                    connectParticles: true
                });
                setParticles(particles);
            }
        );

        return stop;
    }, [canShow()]);

    if (!canShow()) return null;
    return <canvas className={`overlay__particles ${visible ? "-visible" : ""}`} />;
}

export default observer(OverlayParticles);

function waitFor(func, callback) {
    // const val = func();
    const intervalId = window.setInterval(function() {
        const val = func();
        if (val) {
            window.clearInterval(intervalId);
            callback(val);
        } else {
            console.log("OverlayPartiles no Particles so far");
        }
    }, 500);
}
