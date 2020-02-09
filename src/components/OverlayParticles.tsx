import { observer } from "mobx-react-lite";
import React, { useEffect, useState, useRef } from "react";
// import { uiState } from "../store";
import browser from "../utils/browser";
import { useAutorun } from "../utils/mobx";
import "./OverlayParticles.scss";
import { useUiState } from "../tools/use";

function OverlayParticles() {
    const [visible, setVisible] = useState(false);
    const [ParticlesClass, setParticlesClass] = useState();
    const [canShow, setCanShow] = useState(false);
    const canvas = useRef();
    const uiState = useUiState();

    useAutorun(() => setCanShow(uiState.overlayPosition === "left" && !browser.isEdgeHtml));

    // init ParticlesClass
    useEffect(() => {
        // console.log("zz",1);

        if (canShow && !ParticlesClass) {
            // console.log("zz");
            import(/* webpackChunkName: "particlesjs" */ "particlesjs").then(p => {
                setParticlesClass(p.default);
            });
            // waitFor(
            //     () => window["Particles"],
            //     Particles => setParticlesClass(Particles)
            // );
        }
    }, [canShow, ParticlesClass]);

    // init/destroy particles
    useEffect(() => {
        if (ParticlesClass && canShow) {
            const particles = ParticlesClass.init({
                selector: canvas.current,
                maxParticles: 50,
                speed: 0.4,
                sizeVariations: 4,
                color: "#557988",
                connectParticles: true
            });
            setVisible(true);

            return () => {
                // try{
                particles.destroy();
                // }catch{}
            };
        }
    }, [ParticlesClass, canShow]);

    if (!canShow) return null;
    return (
        <div>
            <canvas className={`overlay-particles__canvas ${visible ? "-visible" : ""}`} ref={canvas} />
        </div>
    );
}

export default observer(OverlayParticles);

// function waitFor(func, callback) {
//     // const val = func();
//     const intervalId = window.setInterval(function() {
//         const val = func();
//         if (val) {
//             window.clearInterval(intervalId);
//             callback(val);
//         } else {
//             console.log("OverlayPartiles no Particles so far");
//         }
//     }, 500);
// }
