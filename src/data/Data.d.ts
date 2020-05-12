interface Data {
    noAds: boolean;
    noFeatured: boolean;
    expoFpAd: boolean;
    title: string;
    subtitle: string;
    homeUrl: string;
    registerUrl: string;
    logo: string;
    gtag: string;
    boothTerm: string;
    locale: string;
    booths: RawBooth[];
    exhibitors: RawExhibitor[];
    categories: RawCategory[];
    reserveInstructions: string;
    sendLoginLinkUrl: string;
    trackerUrl: string;
    // hideCompanies: boolean;
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

    checkVideoChatUrl: string;

    //populated
    logo: string;
    categories: number[];
}

interface PathInfo {
    triangles: Triangle[];
    color: string;
}

const __fp: string;
const __fpPaths: { [id: string]: any };
