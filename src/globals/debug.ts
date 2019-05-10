export {};
declare global {
    const debugCanvases: HTMLCanvasElement[];
    // const devtools: boolean;
}

// const devtool = /./ as any;
// devtool.toString = function() {
//     debugger
//     extendGlobal({ devtools: true });
//     return 'devtools detected';
// };

extendGlobal({ debugCanvases: [] });//, devtools: false
// __logger.log('%c', devtool);


