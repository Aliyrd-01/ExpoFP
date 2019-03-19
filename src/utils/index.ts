export function isShallowEqual(v: any, o: any) {
    if (!v !== !o) return false

    for (var key in v)
        if (!(key in o) || v[key] !== o[key])
            return false

    for (var key in o)
        if (!(key in v) || v[key] !== o[key])
            return false

    return true
}
export function debounce(func: Function, wait: number, immediate: boolean) {
    var timeout: any;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

export function shuffle<T>(array: T[]) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }
  

export function rtp(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}


// //https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
// export function copyToClipboard(str) {
//     const el = document.createElement("textarea"); // Create a <textarea> element
//     el.value = str; // Set its value to the string that you want copied
//     el.setAttribute("readonly", ""); // Make it readonly to be tamper-proof
//     el.style.position = "absolute";
//     el.style.left = "-9999px"; // Move outside the screen to make it invisible
//     document.body.appendChild(el); // Append the <textarea> element to the HTML document
//     const selected =
//         document.getSelection().rangeCount > 0 // Check if there is any content selected previously
//             ? document.getSelection().getRangeAt(0) // Store selection if found
//             : false; // Mark as false to know no selection existed before
//     el.select(); // Select the <textarea> content
//     document.execCommand("copy"); // Copy - only works as a result of a user action (e.g. click events)
//     document.body.removeChild(el); // Remove the <textarea> element
//     if (selected) {
//         // If a selection existed before copying
//         document.getSelection().removeAllRanges(); // Unselect everything on the HTML document
//         document.getSelection().addRange(selected); // Restore the original selection
//     }
// }
