import '@/globals'
import '@/store'
import '@/services'

import Layout from './components/Layout.vue'

Vue.config.productionTip = false

new Vue({
    store,
    render: h => h(Layout)
}).$mount('#app')



// window.addEventListener("scroll", function (e) {
//     document.body.scrollTop = 0;
// })
