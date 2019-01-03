// import extendGlobal from '@/utils/extend-global'
export { }
namespace local {
    export class Color {
        readonly r: number; // 0 - 255
        readonly g: number; // 0 - 255
        readonly b: number; // 0 - 255
        readonly a: number; // 0 - 1

        constructor(r: number, g: number, b: number, a: number = 1) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }

        static fromHex(hex: string) {
            var ar = hexToRgbA(hex);
            return new Color(ar[0], ar[1], ar[2], ar[3]);
        }

        toVec4(): Vec4 {
            return [this.r / 255, this.g / 255, this.b / 255, this.a];
        }
    }
}

// https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
function hexToRgbA(hex) {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return [(c >> 16) & 255, (c >> 8) & 255, c & 255, 1];
        //return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
    }
    throw new Error('Bad Hex');
}

declare global {
    const Color: typeof local.Color;
    type Color = local.Color;
}

extendGlobal({ Color: local.Color })

