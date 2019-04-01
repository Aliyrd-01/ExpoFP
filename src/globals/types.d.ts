declare const __data: {
    title: string;
    subtitle: string;
    homeUrl: string;
    logo: string;
    gtag: string;
    boothTerm: string;
    booths: Booth[];
    exhibitors: Exhibitor[];
    categories: Category[];
    reserveInstructions: string;
    sendLoginLinkUrl: string;
};
declare const __fp: string;
declare const __fpPaths: { [id: string]: any };
declare const __icons: { [id: string]: string };

interface Booth {
    id: number;
    name: string;
    exhibitors: number[];
    // populated
    rect: Rect;
    rotate: number;
    slug: string;
    error?: boolean;
    size: string;
    price: string;
    //availableColor: string,// obsolete
    availColor: string; // new
    soldColor: string;
    buyUrl: string;
    //boothTypeName: string,// obsolete
    type: string; // new
    //isOnHold: boolean,// obsolete
    onHold: boolean; // new
    hideName: boolean;
}

interface Exhibitor {
    id: number;
    name: string;
    // isFeatured: boolean,//obsolete
    featured: boolean; //new
    advertise: boolean;
    description: string;
    address: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone1: string;
    website: string;
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
    googlePlus: string;
    xing: string;
    youtube: string;
    //publicEmail: string, // obsolete
    email: string; // new
    privateEmail: string;
    //...

    //populated
    logo: string;
    slug: string;
    booths: number[];
    categories: number[];
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

type OverlaySize = "full" | "medium" | "small";
type OverlayPosition = "left" | "bottom";
type MapOccupied = null | "left" | "bottomSmall" | "bottomMedium";

type ZoomTransform = typeof d3.zoomIdentity; // { x: number; y: number; k: number };

declare const EFP_EXPO: string;
//declare const EFP_TITLE: string;
//declare const EFP_HOME_URL: string;
// declare const EFP_LOGO_URL: string;
// declare const GTAG: string;
// declare const gtag: any;
