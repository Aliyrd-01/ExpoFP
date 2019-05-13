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
import '@/tools/logger';
import reportError from '@/tools/report-error';
import '@/tools/validate-data';
import '@/tools/gtag'
import '@/store';
import '@/services';

import Layout from '@/components/Layout.vue';
import Vue from 'vue';


// var a = null;
// alert(a.prop);

Vue.config.productionTip = false;
Vue.prototype.__data = __data;
Vue.prototype.__settings = __settings;

new Vue({
    store,
    render: h => h(Layout),
    errorCaptured(error, vm, info) {
        reportError({ message: `Error in ${info}: "${error.toString()}"`, error });
    }
}).$mount('#app');

window.addEventListener("error", reportError);


// window.addEventListener("scroll", function (e) {
//     document.body.scrollTop = 0;
// })
