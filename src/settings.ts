import deepmerge from 'deepmerge';

let settings = {
    debug: (localStorage.getItem('debug') || location.host.startsWith('dev')) && localStorage.getItem('debug') !== '0',
    borderWidth: 1,
    colors: {
        base: '#ebebeb',
        booths: {
            default: '#41b6e7',
            selected: '#000',//'#002cff',
            empty: 'rgba(0,0,0,0.205)', // this is #aaa for default BG #d6d6d6d
        }
    }
}

if (EFP_EXPO === "jtrade19") {
    settings.colors.booths.selected = '#dc6533';
}

settings = deepmerge(settings, window['__settings'] || {});
export default settings;
extendGlobal({ __settings: settings })

declare global {
    const __settings: typeof settings;
}
