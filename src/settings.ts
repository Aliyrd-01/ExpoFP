

const settings = {
    title: 'in-cosmetics North America 2018',
    homeUrl: 'http://northamerica.in-cosmetics.com/',
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

export default settings;
extendGlobal({ __settings: settings })

