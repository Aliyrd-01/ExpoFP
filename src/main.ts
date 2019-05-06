//import * as d31 from 'd3'
import 'core-js/features/array/from';
import 'core-js/features/array/find';
import 'core-js/features/promise';
import 'core-js/features/object/values';
import 'core-js/features/string/ends-with';
import 'path2d-polyfill';
import 'url-polyfill';
import '@/globals';
import '@/settings';
import '@/utils/logging';
import '@/tools/validate-data';
import '@/tools/gtag'
import '@/store';
import '@/services';

import Layout from '@/components/Layout.vue';


Vue.config.productionTip = false
Vue.prototype.__data = __data;
Vue.prototype.__settings = __settings;

const df = document['fonts'];
window.addEventListener("load", render);
if (df) df.ready.then(render);

let rendered = false;
function render() {
    if (rendered) return;
    rendered = true;
    new Vue({
        store,
        render: h => h(Layout)
    }).$mount('#app');
}




// window.addEventListener("scroll", function (e) {
//     document.body.scrollTop = 0;
// })
