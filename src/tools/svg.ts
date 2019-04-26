function parseSvg(text: string) {
    // if (EFP_EXPO === "demo") text = replaceXml(text);
    // console.log(text);

    const parser = new DOMParser();
    return parser.parseFromString(text, "image/svg+xml").documentElement as any as SVGElement;
}

const overrideSvg = localStorage.getItem('overrideSvg');

let svg = parseSvg(overrideSvg || __fp);
if ((svg.firstChild as Element).tagName === "parsererror") {
    console.error('Parsed svg with error: ', svg)
    if (overrideSvg) {
        alert('FP SVG error, see console');
        svg = parseSvg(__fp);
    }
}

// prepare map of fill colors per class
const classFill = new Map<string, string>();;
d3.select(svg).selectAll("style").each(function () {
    const css = (this as any).textContent as string;
    const r = /\.([a-z0-9.]+)\s*{[^}]*fill\s*:\s*([^};]+);[^}]*}/gi;
    let m: string[];
    while ((m = r.exec(css)) !== null) {
        const cls = m[1], fill = m[2];
        classFill.set(cls, fill);
    }
});

// set fill attrs for elements having class attrs
d3.select(svg).selectAll("*[class]").each(function () {
    const el = this as SVGGraphicsElement;
    el.style.fill = classFill.get(el.className.baseVal);
});


const viewBox = (svg as any).viewBox;
export const svgWidth = viewBox.baseVal.width as number;
export const svgHeight = viewBox.baseVal.height as number;

d3.select(svg).attr('width', svgWidth);
d3.select(svg).attr('height', svgHeight);

export default svg

