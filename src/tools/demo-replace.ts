// export function replaceXml(xml: string) {
//     return xml.replace(/(id="b)([abcde])(\d+")/g, (m, p1, p2, p3) => p1 + replaceLetter(p2) + p3)
// }

// function replace(x: string) {
//     // abcde -> edbac
//     switch (x) {
//         case 'a': return 'e';
//         case 'b': return 'd';
//         case 'c': return 'b';
//         case 'd': return 'a';
//         case 'e': return 'c';
//     }
//     return x;
// }

// export function replaceLetter(x: string) {
//     // return x;
//     const uppercase = x === x.toUpperCase();
//     x = replace(x.toLowerCase());
//     if (uppercase) return x.toUpperCase();
//     return x;
// }