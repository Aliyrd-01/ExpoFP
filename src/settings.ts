import deepmerge from 'deepmerge';

// TODO: remove unneeded settings from here (leave debug only)?


let settings = {
    debug: (localStorage.getItem('debug') || location.host.startsWith('dev')) && localStorage.getItem('debug') !== '0',
    borderWidth: 1,
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
            empty: '#aaaaaa',
        }
    }
}

if (EFP_EXPO === "jtrade19"){
    settings.colors.booths.selected = '#dc6533';
}

settings = deepmerge(settings, window['__settings'] || {});
export default settings;
extendGlobal({ __settings: settings })

declare global {
    const __settings: typeof settings;
}
 