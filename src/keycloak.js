import Vue from 'vue';
import Keycloak from 'keycloak-js';
import { EventBus } from '@/../event-bus.js';

const initOptions = {
    url: process.env.VUE_APP_KEYCLOAK_URL,
    realm: process.env.VUE_APP_KEYCLOAK_REALM,
    clientId: process.env.VUE_APP_KEYCLOAK_CLIENT_ID,
};

const keycloakJs = new Keycloak(initOptions);

export default class KeycloakHelper {

    constructor(instantiatedBy) {
        console.log("KCHelper instantiated by: " + instantiatedBy);
    }

    async initialise() {
        return new Promise((resolve, reject) => {
            Vue.$keycloak.init({
                onLoad: 'login-required',
                pkceMethod: "S256"
            }).then(() => {
                resolve(true);
            }).catch(() => {
                reject(false);
            });
        });
    }
}

const Plugin = {
    install: Vue => {
        Vue.$keycloak = keycloakJs;
    },
};
Plugin.install = Vue => {
    Vue.$keycloak = keycloakJs;
    Object.defineProperties(Vue.prototype, {
        $keycloak: {
            get() {
                return keycloakJs;
            },
        },
    });
};

Vue.use(Plugin);

Vue.$keycloak.onTokenExpired = () => {
  console.log("onTokenExpired");
  EventBus.$emit('onTokenExpired');
}