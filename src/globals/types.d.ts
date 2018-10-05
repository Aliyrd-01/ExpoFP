declare const __data: {
    booths: Booth[],
    exhibitors: Exhibitor[],
    categories: Category[]
};
declare const __fp: string;
declare const __icons: { [id: string]: string };

interface Booth {
    id: number,
    name: string
    exhibitors: number[]
    // populated
    rect: Rect,
    slug: string,
    error?: boolean,
    size: string,
    price: string
}

interface Exhibitor {
    id: number,
    name: string,
    description: string,
    address: string,
    address2: string,
    phone1: string,
    website: string,
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


declare const EFP_EXPO:string;
declare const EFP_TITLE:string;
declare const EFP_HOME_URL:string;
declare const EFP_LOGO_URL:string;