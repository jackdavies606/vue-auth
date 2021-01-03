import Vue from 'vue'
import App from './App.vue'
import '@/keycloak';
import KeycloakHelper from "@/keycloak";

Vue.config.productionTip = false

initialise();

async function initialise() {
    const success = await new KeycloakHelper('main.js').initialise();

    if (success) {
        console.log("is authenticated (pre-mount): " + Vue.$keycloak.authenticated);
        new Vue({
            render: h => h(App),
        }).$mount('#app')
    } else {
        console.log("Intitialisation falied. Yikes.");
    }
}