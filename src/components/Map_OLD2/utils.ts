
// export function getFpDestinationRectangle(svgWidth: number, svgHeight: number, canvasWidth: number, canvasHeight: number, visibleRect: Rect) {
//     // debugger
//     if (!visibleRect) visibleRect = Rect.fromXywh(0, 0, canvasWidth, canvasHeight);
//     const visibleRatio = visibleRect.w / visibleRect.h;
//     const svgRatio = svgWidth / svgHeight;

//     // const canvasRatio = canvasWidth / canvasHeight;
//     // const svgRatio = svgWidth / svgHeight;
//     let svgW, svgH
//     if (visibleRatio < svgRatio) {
//         svgW = visibleRect.w;
//         svgH = visibleRect.w / svgRatio;
//     } else {
//         svgH = visibleRect.h;
//         svgW = visibleRect.h * svgRatio;
//     }
//     const svgDx = (visibleRect.w - svgW) / 2;
//     const svgDy = (visibleRect.h - svgH) / 2;
//     const scale = svgW / svgWidth;
//     return { x: svgDx + visibleRect.x1, y: svgDy + visibleRect.y1, width: svgW, height: svgH, scale };
// }

export function remsToPixels(rem: number): number {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export function getFont(px: number, weight: number) {
    return weight + " " + px + 'px -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
}

// UTILS
// export function createShader(gl:WebGLRenderingContext, type, source) {
//     var shader = gl.createShader(type);   // создание шейдера
//     gl.shaderSource(shader, source);      // устанавливаем шейдеру его программный код
//     gl.compileShader(shader);             // компилируем шейдер
//     var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
//     if (success) {                        // если компиляция прошла успешно - возвращаем шейдер
//         return shader;
//     }

//     console.log(gl.getShaderInfoLog(shader));
//     gl.deleteShader(shader);
// }

// export function createProgram(gl:WebGLRenderingContext, vertexShader:WebGLShader, fragmentShader:WebGLShader) {
//     var program = gl.createProgram();
//     gl.attachShader(program, vertexShader);
//     gl.attachShader(program, fragmentShader);
//     gl.linkProgram(program);
//     var success = gl.getProgramParameter(program, gl.LINK_STATUS);
//     if (success) {
//         return program;
//     }

//     console.log(gl.getProgramInfoLog(program));
//     gl.deleteProgram(program);
// }



