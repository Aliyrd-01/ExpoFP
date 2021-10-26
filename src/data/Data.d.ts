interface Data {
    noFeatured: boolean;
    expoFpAd: boolean;
    title: string;
    subtitle: string;
    homeUrl: string;
    registerUrl: string;
    logo: string;
    gallery: string[];
    gtag: string;
    boothTerm: string;
    exhibitorTerm: string;
    locale: string;
    booths: RawBooth[];
    exhibitors: RawExhibitor[];
    categories: RawCategory[];
    reserveInstructions: string;
    sendLoginLinkUrl: string;
    trackerUrl: string;
    // hideCompanies: boolean;
    dimensionless: boolean;
}

interface RawCategory {
    id: number;
    name: string;
    sponsorship: boolean;
}

type RawBooth = RawRegularBooth | RawSpecialBooth;

interface RawRegularBooth extends RawBoothBase {
    exhibitors: number[];
    // populated
    size: string; // comes from svg or data.js
    price: string; // comes from svg or data.js
    availColor: string; // comes from svg or data.js
    soldColor: string; // comes from svg or data.js
    buyUrl: string;
    reserveUrl: string;
    type: string;
    // onHold: boolean;
    // reserved: boolean;
    exhibitors: number[];
}

interface RawSpecialBooth extends RawBoothBase {
    title: string;
    description: string;
    color: string; // comes from svg or data.js
    special: true;
}

interface RawBoothBase {
    id: number;
    name: string;
    title: string;
    externalId: string;
    // special?: true;
    // rect: Rect;
    // noLabels: boolean;
    // rotate: number;
    // paths: PathInfo[];
    // slug: string;
    // error?: boolean;
}

interface RawExhibitor {
    id: number;
    name: string;
    externalId: string; //new
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
    email: string; // new
    privateEmail: string;

    //populated
    logo: string;
    gallery: string[];
    marketMaterials: MarketMaterial[];
    categories: number[];
    leadingImageUrl: string;
    videoUrl: string;
}

interface PathInfo {
    triangles: Triangle[];
    color: string;
}

interface MarketMaterial {
    fileName: string;
    path: string;
}

const __fp: string;
const __fpPaths: { [id: string]: any };
