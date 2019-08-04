import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { uiState } from "../store";
import { useAutorun } from "../utils/mobx";
import "./OverlayParticles.scss";

function OverlayParticles() {
    const [visible, setVisible] = useState(false);
    const [ParticlesClass, setParticlesClass] = useState();
    const [canShow, setCanShow] = useState(false);

    useAutorun(() => setCanShow(uiState.overlayPosition === "left"));

    // init ParticlesClass
    useEffect(() => {
        if (canShow && !ParticlesClass) {
            waitFor(() => window["Particles"], Particles => setParticlesClass(Particles));
        }
    }, [canShow, ParticlesClass]);

    // init/destroy particles
    useEffect(() => {
        if (ParticlesClass && canShow) {
            const particles = ParticlesClass.init({
                selector: ".overlay__particles",
                maxParticles: 50,
                speed: 0.4,
                sizeVariations: 4,
                color: "#557988",
                connectParticles: true
            });
            setVisible(true);

            return () => {
                particles.destroy();
            };
        }
    }, [ParticlesClass, canShow]);

    if (!canShow) return null;
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
