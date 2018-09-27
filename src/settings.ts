import deepmerge from 'deepmerge';


const defaultSettings = {
    //fontSizeDetails: 12,
    debug: localStorage.getItem('debug'),//; document.body.clientWidth > 1000,
    colors: {
        base: '#ebebeb',
        bg: '#d6d6d6',
        fg: '#fff',
        columns: 'rgba(0,0,0,0.1)',
        icons: 'rgba(0,0,0,0.4)',
        dim: 0.5,
        booths: {
            default: '#41b6e7',
            selected: '#FB3E59',
            // defaultHover: '#2ca2d3',
            // selected: '#f3b501',
            empty: '#b3b3b3',
            // emptyHover: '#9a9a9a',
        }
    }
}

const settings = deepmerge(defaultSettings, __settings);
export default settings;
extendGlobal({ __settings: settings })

declare global {
    const __settings: typeof defaultSettings;
}
