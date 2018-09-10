
function parseSvg(text: string) {
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

const viewBox = (svg as any).viewBox;
export const svgWidth = viewBox.baseVal.width as number;
export const svgHeight = viewBox.baseVal.height as number;

d3.select(svg).attr('width', svgWidth);
d3.select(svg).attr('height', svgHeight);

export default svg

