import jsPDF from "jspdf";
import slugify from "slugify";
import createDrawer from "../components/Map/drawing/Drawer1";
import data from "../data";
import { svgSize } from "../data/svg";
import debugCanvases from "./debugCanvases";
import pdfFontBold from "./pdf-open-sans-bold.txt";
import pdfFontNormal from "./pdf-open-sans-normal.txt";

const jsPDFAPI = jsPDF["API"];

export async function generatePdf() {
    const dpi = 72;
    const printerPpi = 300;
    const format = "Tabloid";

    //const titleFontSizePercentOfWidth = 0.05;
    const orientation = svgSize.width / svgSize.height > 1.2 ? "landscape" : "portrait";
    const doc = new jsPDF({ format, orientation });
    const anyDoc = doc as any; // convenience
    const width = Math.ceil(doc.internal.pageSize.getWidth());
    const height = Math.ceil(doc.internal.pageSize.getHeight());
    const baseSize = Math.min(width, height);

    const titleFontSize = baseSize * 0.04;
    const setTitleFont = () => {
        doc.setFontSize(mmToPt(titleFontSize)).setFont("OpenSans-Bold");
    };
    const subTitleFontSize = titleFontSize * 0.4;
    const setSubtitleFont = () => {
        doc.setFontSize(mmToPt(subTitleFontSize)).setFont("OpenSans-Regular");
    };

    doc.setFillColor("#EBEBEB");
    doc.rect(0, 0, width, height, "f");

    let occupied = 0;
    {
        const headerPadding = baseSize * 0.015 * (orientation === "landscape" ? 1.1 : 1);
        const headerWidth = width - headerPadding * 2;

        setTitleFont();

        const titleLines = doc.splitTextToSize(data.title, headerWidth);
        const titleLinesHeight = titleLines.length * ptToMm(doc.getLineHeight());

        setSubtitleFont();
        doc.setFont("OpenSans-Regular");
        doc.setFontSize(mmToPt(subTitleFontSize));

        const subtitleLines = doc.splitTextToSize(data.subtitle, headerWidth);
        const subtitleLinesHeight = subtitleLines.length * ptToMm(doc.getLineHeight());

        const totalHeight = headerPadding * 2 + titleLinesHeight + subtitleLinesHeight;

        doc.setFillColor("#444");
        doc.rect(0, 0, width, totalHeight, "f");

        setTitleFont();
        anyDoc.setTextColor("#fff");
        doc.text(titleLines, width / 2, headerPadding, { align: "center", baseline: "top" });

        setSubtitleFont();
        anyDoc.setTextColor("#eee");
        doc.text(subtitleLines, width / 2, titleLinesHeight + headerPadding, { align: "center", baseline: "top" });

        occupied = totalHeight;
    }

    const imgPadding = baseSize * 0.005;

    const heightLeft = height - occupied - imgPadding * 2;

    const blockHeight = heightLeft;
    const blockWidth = width - imgPadding * 2;

    const yRatio = blockHeight / svgSize.height;
    const xRatio = blockWidth / svgSize.width;
    const ratio = Math.min(yRatio, xRatio);

    const imageWidth = svgSize.width * ratio;
    const imageHeight = svgSize.height * ratio;

    const cx = width / 2;
    const cy = occupied + imgPadding + blockHeight / 2;
    const left = cx - imageWidth / 2;
    const top = cy - imageHeight / 2;

    // doc.rect(left, top, imageWidth, imageHeight);

    const canvas = document.createElement("canvas");
    canvas.width = mmToPrinterPoints(imageWidth);
    canvas.height = mmToPrinterPoints(imageHeight);

    debugCanvases.push(canvas);

    const drawer = createDrawer(canvas, false);
    drawer.setVisibleScale(1);
    drawer.setPixelRatio(2.5);
    // drawer.resetCanvasSize();
    drawer.draw();

    doc.addImage(canvas, "JPEG", left, top, imageWidth, imageHeight);

    // doc.setFontSize(mmToPt(subTitleFontSize * 0.8)).setFont("OpenSans-Regular");
    // doc.text("Made with ExpoFP.com", width, height, { align: "right", baseline: "bottom" });

    {
        // logo
        const logoWidth = 586;
        const logoHeight = 128;
        const logoHeightMm = baseSize * 0.02;
        const logoWidthMm = (logoHeightMm * logoWidth) / logoHeight;
        const logoPadding = logoHeightMm;
        doc.addImage(
            "data:image/png;base64,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",
            "PNG",
            width - logoWidthMm - logoPadding,
            height - logoHeightMm - logoPadding,
            logoWidthMm,
            logoHeightMm
        );
    }

    // __logger.log('generatePdf', {
    //     //width, height, padding, titleFontSize, fontList: doc.getFontList(), imageWidth, imageHeight, canvasWidth: canvas.width
    // });

    doc.save(slugify(data.title, { remove: /[*+~.()'"!:@]/g, lower: true }) + ".pdf");

    function mmToPt(mm: number) {
        return (mm / 25.4) * dpi;
    }

    function mmToPrinterPoints(mm: number) {
        return (mm / 25.4) * printerPpi;
    }

    function ptToMm(pt: number) {
        return (pt * 25.4) / dpi;
    }
}

// USE THIS: https://github.com/MrRio/jsPDF/blob/master/fontconverter/fontconverter.html
// or same from rawgit website

(function(jsPDFAPI) {
    var font = pdfFontBold;
    var callAddFont = function() {
        //@ts-ignore
        this.addFileToVFS("OpenSans-Bold-bold.ttf", font);
        //@ts-ignore
        this.addFont("OpenSans-Bold-bold.ttf", "OpenSans-Bold", "normal");
    };
    jsPDFAPI.events.push(["addFonts", callAddFont]);
})(jsPDFAPI);

(function(jsPDFAPI) {
    var font = pdfFontNormal;

    var callAddFont = function() {
        //@ts-ignore
        this.addFileToVFS("OpenSans-Regular-normal.ttf", font);
        //@ts-ignore
        this.addFont("OpenSans-Regular-normal.ttf", "OpenSans-Regular", "normal");
    };
    jsPDFAPI.events.push(["addFonts", callAddFont]);
})(jsPDFAPI);
