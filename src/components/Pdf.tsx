import { useObserver } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { uiState } from "../store";
import { isWebGlSupported } from "../utils";
import "./Pdf.scss";

function Pdf() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // print pdf
        window.setTimeout(() => {
            setVisible(true);
        }, 10);

        window.setTimeout(async () => {
            const { generatePdf } = await import(/* webpackChunkName: "tools-pdf" */ "../tools/pdf");
            await generatePdf();

            window.setTimeout(() => {
                setVisible(false);
                window.setTimeout(() => {
                    uiState.printingPdf = false;
                }, 300);
            }, 2000);
        }, 300);
    }, []);

    return (
        <div className={`pdf ${visible ? "-visible" : null}`}>
            <div className="pdf__text">Preparing PDF...</div>
        </div>
    );
}

export default () => useObserver(() => uiState.printingPdf && isWebGlSupported && <Pdf />);
