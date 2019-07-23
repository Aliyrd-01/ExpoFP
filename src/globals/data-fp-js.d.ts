import { Category } from "@/store/CategoryStore";

declare global {
    const __data: {
        title: string;
        subtitle: string;
        homeUrl: string;
        logo: string;
        gtag: string;
        boothTerm: string;
        // booths: Booth[];
        // exhibitors: Exhibitor[];
        categories: Pick<Category, 'id' | 'name'>[]
        reserveInstructions: string;
        sendLoginLinkUrl: string;
    };

    const __fp: string;
    const __fpPaths: { [id: string]: any };
    const __icons: { [id: string]: string };
}

// type Booth = SpecialBooth | RegularBooth;

// interface RegularBooth extends BoothBase {
//     exhibitors: number[];
//     // populated
//     size: string; // comes from svg or data.js
//     price: string; // comes from svg or data.js
//     availColor: string; // comes from svg or data.js
//     soldColor: string; // comes from svg or data.js
//     // typeColor: string;
//     buyUrl: string;
//     reserveUrl: string;
//     type: string; 
//     onHold: boolean; 
//     special: false;
// }

// interface SpecialBooth extends BoothBase {
//     title: string;
//     description: string;
//     color: string; // comes from svg or data.js
//     special: true;
// }

// interface BoothBase {
//     id: number;
//     name: string;
//     title: string;
//     rect: Rect;
//     noLabels: boolean;
//     rotate: number;
//     paths: PathInfo[];
//     slug: string;
//     error?: boolean;
// }

interface PathInfo {
    triangles: Triangle[];
    color: string;
}

// interface Exhibitor {
//     id: number;
//     name: string;
//     // isFeatured: boolean,//obsolete
//     featured: boolean; //new
//     advertise: boolean;
//     description: string;
//     address: string;
//     address2: string;
//     city: string;
//     state: string;
//     zip: string;
//     country: string;
//     phone1: string;
//     website: string;
//     facebook: string;
//     instagram: string;
//     linkedin: string;
//     twitter: string;
//     googlePlus: string;
//     xing: string;
//     youtube: string;
//     //publicEmail: string, // obsolete
//     email: string; // new
//     privateEmail: string;
//     //...

//     //populated
//     logo: string;
//     slug: string;
//     booths: number[];
//     categories: number[];
// }

// interface Category {
//     id: number;
//     name: string;
//     slug: string;
// }
