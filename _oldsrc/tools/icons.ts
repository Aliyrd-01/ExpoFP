
function parseSvg(text: string) {
    const parser = new DOMParser();
    return parser.parseFromString(text, "image/svg+xml").documentElement as any as SVGElement;
}

export type IconData = { type: string, width: number, height: number, svg: SVGElement };
const icons = {} as { [id: string]: IconData };

for (const k of Object.keys(__icons)) {
    const svg = parseSvg(__icons[k]);
    const viewBox = (svg as any).viewBox;
    const width = viewBox.baseVal.width as number;
    const height = viewBox.baseVal.height as number;

    d3.select(svg).attr('width', width);
    d3.select(svg).attr('height', height);
    icons[k] = {
        type:k,
        width,
        height,
        svg
    };
}

export default icons;


