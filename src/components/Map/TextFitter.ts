// export interface TextFitData {
//     factor: number;
//     fontSize: number;
//     lines: string[];
//     width: number;
// }

// export default class TextFitter {
//     private readonly maxMultilineFontSize: number;
//     private readonly baseFontSize: number;
//     private readonly fontSizes: number[];
//     private readonly ctx: CanvasRenderingContext2D;
//     private readonly spaceWidth: number;

//     // pass fontsizes and maxmulti as multiplied on devicePixelRation here
//     constructor(fontFunc: (number) => string, fontSizes: number[], maxMultilineFontSize: number) {
//         this.baseFontSize = this.maxMultilineFontSize = maxMultilineFontSize;
//         this.fontSizes = fontSizes;
//         fontFunc;
//         const canvas = document.createElement("canvas");
//         this.ctx = canvas.getContext("2d");
//         this.ctx.textAlign = "center";
//         this.ctx.textBaseline = "alphabetic";
//         this.ctx.font = fontFunc(this.baseFontSize);
//         this.spaceWidth = this.ctx.measureText(" ").width;
//     }

//     getStepsForRect(text: string, width: number, height: number): TextFitData[] {
//         const words = text.split(/\s+/);
//         const blocks = words.map(w => this.ctx.measureText(w).width);

//         const res = [];
//         let minFactor = Infinity;
//         let minRows = 0;

//         for (const fontSize of this.fontSizes) {
//             const lineHeight = fontSize;

//             const factor = fontSize / this.baseFontSize;
//             const sBlocks = blocks.map(b => b * factor);
//             const sSpaceWidth = this.spaceWidth * factor;

//             const widths = getLinesSizes(sBlocks, sSpaceWidth, fontSize > this.maxMultilineFontSize ? 1 : Infinity);

//             for (let i = 0; i < widths.length; i++) {
//                 const w = widths[i];
//                 const minWidth = w;
//                 const rows = i + 1;
//                 const minHeight = lineHeight * rows;
//                 const factorW = minWidth / width;
//                 const factorH = minHeight / height;
//                 const factor = Math.max(factorH, factorW);
//                 if (factor > minFactor || rows < minRows) continue;
//                 minFactor = factor;
//                 minRows = rows;

//                 const lineSetsPossible = getPossibleLineSetsForWidth(w, rows, sBlocks, sSpaceWidth);
//                 const lineSetBest = selectBestLines(lineSetsPossible, sBlocks, sSpaceWidth);
//                 const lines = lineIndicesToLines(lineSetBest, words);

//                 res.push({
//                     factor, // minimum value to fit
//                     fontSize,
//                     lines,
//                     width: w
//                 });
//             }
//         }

//         return res;
//     }
// }

// // utility context-less functions
// function getLinesSizes(blocks, spaceWidth, maxLines) {
//     const res = [];

//     let prevLongestLine;
//     let prevLines = 1;
//     let width = Infinity;

//     let lineWidths;
//     while ((lineWidths = getLineWidthsForMaxWidth(width, blocks, spaceWidth)) && lineWidths.length <= maxLines) {
//         if (prevLines !== lineWidths.length) {
//             // here we'll come starting with prevLines == 1 and lineWidths.length >= 2
//             res[prevLines - 1] = prevLongestLine;
//         }

//         prevLines = lineWidths.length;
//         prevLongestLine = Math.max(...lineWidths);
//         width = prevLongestLine - 1;
//     }

//     res[prevLines - 1] = prevLongestLine;

//     return res;
//     // 183 - min width for 1 line
//     // 72 - min width for 2 lines
//     // 36 - 3 lines
//     // everythin smaller than 36 doesn't fit anything
// }

// function getLineWidthsForMaxWidth(maxWidth, blocks, spaceWidth) {
//     const lines = [];
//     let currentLineWidth;
//     let currentLineIndex = -1;

//     function startNewLine() {
//         currentLineIndex++;
//         currentLineWidth = 0;
//     }

//     startNewLine();
//     for (const b of blocks) {
//         const supposedWidth = currentLineWidth + (currentLineWidth > 0 ? spaceWidth : 0) + b;

//         if (supposedWidth > maxWidth) {
//             // item doesn't fit
//             if (b > maxWidth) return null;
//             startNewLine();
//             currentLineWidth = b;
//         } else {
//             currentLineWidth = supposedWidth;
//         }

//         lines[currentLineIndex] = currentLineWidth;
//     }

//     return lines;
// }

// function standardDeviation(array) {
//     const n = array.length;
//     const mean = array.reduce((a, b) => a + b) / n;
//     return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
// }

// function lineIndicesToLines(lineSet, words) {
//     return lineSet.map(line => line.map(i => words[i]).reduce((a, v, i) => a + (i > 0 ? " " : "") + v), "");
//     // ["line1", "line2"]
// }

// function selectBestLines(lineSets, blocks, spaceWidth) {
//     const vars = lineSets.map(ll => {
//         const widths = ll.map(
//             line => line.map(i => blocks[i]).reduce((a, v, i) => a + (i > 0 ? spaceWidth : 0) + v),
//             0
//         );

//         const dd = standardDeviation(widths);
//         return { ll, dd };
//     });
//     vars.sort((a, b) => a.dd - b.dd);
//     return vars.map(r => r.ll)[0];
// }

// function getPossibleLineSetsForWidth(maxWidth, lineCount, blocks, spaceWidth) {
//     return getLineSets(lineCount, 0);

//     // recursive function, returns array of arrays of lines
//     function getLineSets(linesLeft, from) {
//         // if (linesLeft === 0) return [];
//         const lines = getLines(from);
//         const resSets = [];

//         for (const line of lines) {
//             const newFrom = from + line.length;

//             if (newFrom >= blocks.length) {
//                 // ended here. no other blocks
//                 resSets.push([line]);
//                 break;
//             }

//             if (linesLeft > 0) {
//                 const vars = getLineSets(linesLeft - 1, newFrom);
//                 for (const v of vars) {
//                     if (v.length !== linesLeft - 1) continue;
//                     resSets.push([line, ...v]);
//                 }
//             }
//         }
//         return resSets;
//     }

//     // plain function, returns array of lines
//     function getLines(from) {
//         if (from >= blocks.length) throw new Error("From exceed blocks length");
//         const varyWords = [0, -1];

//         let width = 0;
//         let taken = 0;

//         while (
//             blocks.length > from + taken &&
//             (width += (taken > 0 ? spaceWidth : 0) + blocks[from + taken]) &&
//             width / maxWidth < 1.001 // was width <= maxWidth
//         ) {
//             taken++;
//         }

//         return varyWords
//             .map(v => taken + v)
//             .filter(len => len > 0)
//             .map(len => createRange(from, len));

//         // function createRange(start, length) {
//         //     return Array(length)
//         //         .fill(0)
//         //         .map((_, idx) => start + idx);
//         // }

//         function createRange(start, length) {
//             const c = Array(length);
//             while (length--) {
//                 c[length] = length + start;
//             }
//             return c;
//         }
//     }
// }
