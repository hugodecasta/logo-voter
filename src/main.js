import Vue from 'vue'
import App from './App.vue'
import store from './store'
import './plugins/api.js'
import vuetify from './plugins/vuetify'
import mobile_detect from './plugins/mobile_detect'

Vue.use(mobile_detect)

Vue.config.productionTip = false

new Vue({
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
