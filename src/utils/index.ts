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