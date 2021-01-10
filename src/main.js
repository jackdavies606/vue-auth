import Vue from 'vue'
import App from './App.vue'
import '@/keycloak';
import KeycloakHelper from "@/keycloak";

Vue.config.productionTip = false

initialise();

async function initialise() {
    const success = await new KeycloakHelper('main.js').initialise();

    if (success) {
        console.log("initialise() complete. Authenticated!");
        new Vue({
            render: h => h(App),
        }).$mount('#app')
    } else {
        console.log("initialise() failed. Yikes.");
    }
}