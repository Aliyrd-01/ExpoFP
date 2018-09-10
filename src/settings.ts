import deepmerge from 'deepmerge';


const defaultSettings = {
    //fontSizeDetails: 12,
    debug: localStorage.getItem('debug'),//; document.body.clientWidth > 1000,
    colors: {
        base: '#ccc',
        bg: '#fff',
        fg: '#fff',
        columns: 'rgba(0,0,0,0.1)',
        icons: 'rgba(0,0,0,0.4)',
        dim: 0.35,
        booths: {
            default: '#40B5E6',
            defaultHover: '#2075A6',
            selected: '#FB3E59',
            empty: '#B3B9BC',
            emptyHover: '#878c8f',
        }
    }
}

const settings = deepmerge(defaultSettings, __settings);
export default settings;
extendGlobal({ __settings: settings })

declare global {
    const __settings: typeof defaultSettings;
}
