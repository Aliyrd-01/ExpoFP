import { useObserver } from "mobx-react-lite";
import React, { useRef, useEffect, useState } from "react";
import "./TouchHover.scss";


// document.body.addEventListener(x)

export default function LargeMessage() {
    // const [visible, setVisible] = useState(false);
    const el = useRef<HTMLDivElement>();
    const [pass, setPass] = useState<boolean>(false);

    useEffect(() => {
        el.current.addEventListener("touchstart", e => {
            //if (e.touches.length < 2) setPass(false);
            //else setPass(true);
        });
    }, [el.current]);

    return useObserver(() => (
        <div className={"touch-hover" + (pass ? " -pass" : "")} ref={el}>
            123
        </div>
    ));
}
