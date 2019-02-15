declare const __data: {
    title: string,
    homeUrl: string,
    boothTerm: string,
    booths: Booth[],
    exhibitors: Exhibitor[],
    categories: Category[],
    reserveInstructions: string
};
declare const __fp: string;
declare const __fpPaths: { [id: string]: any };
declare const __icons: { [id: string]: string };

interface Booth {
    id: number,
    name: string
    exhibitors: number[]
    // populated
    rect: Rect,
    rotate: number,
    slug: string,
    error?: boolean,
    size: string,
    price: string,
    //availableColor: string,// obsolete
    availColor: string,// new
    soldColor: string,
    buyUrl: string,
    //boothTypeName: string,// obsolete
    type: string,// new
    //isOnHold: boolean,// obsolete
    onHold: boolean,// new
    hideName: boolean
}

interface Exhibitor {
    id: number,
    name: string,
    // isFeatured: boolean,//obsolete
    featured:boolean, //new
    description: string,
    address: string,
    address2: string,
    phone1: string,
    website: string,
    //publicEmail: string, // obsolete
    email,// new
    //...

    //populated
    logo: string,
    slug: string,
    booths: number[],
    categories: number[]
}

interface Category {
    id: number,
    name: string,
    slug: string
}

type OverlaySize = "full" | "medium" | "small"
type OverlayPosition = "left" | "bottom"
type MapOccupied = null | "left" | "bottomSmall" | "bottomMedium"

type ZoomTransform = { x: number, y: number, k: number };


declare const EFP_EXPO: string;
//declare const EFP_TITLE: string;
//declare const EFP_HOME_URL: string;
declare const EFP_LOGO_URL: string;
declare const GTAG: string;
declare const gtag: any;