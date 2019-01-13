import deepmerge from 'deepmerge';

// TODO: remove unneeded settings from here (leave debug only)?


let settings = {
    debug: localStorage.getItem('debug'),
    colors: {
        base: '#ebebeb',
        bg: '#d6d6d6',
        fg: '#fff',
        columns: 'rgba(0,0,0,0.1)',
        icons: 'rgba(0,0,0,0.4)',
        dim: 0.5,
        booths: {
            default: '#41b6e7',
            selected: '#dc6533',
            empty: '#b3b3b3',
        }
    }
}

settings = deepmerge(settings, window['__settings'] || {});
export default settings;
extendGlobal({ __settings: settings })

declare global {
    const __settings: typeof settings;
}
 