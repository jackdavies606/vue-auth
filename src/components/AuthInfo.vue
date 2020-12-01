<template>
  <div>
    <p>{{ this.authenticated }}</p>
    <p>{{ this.accessToken }}</p>
    <p>{{ this.remainingSeconds }}</p>
    <button v-on:click="updateToken()">update token</button>
  </div>
</template>

<script>
import Vue from 'vue';
import { EventBus } from '@/../event-bus.js';

export default {
  name: 'AuthInfo',
  mounted() {
    EventBus.$on('onTokenExpired', () => {
      console.log('Event received: onTokenExpired');
      this.updateToken();
    });

    this.setData();
    this.updateTokenExpiryCallback();
  },
  data() {
    return {
      remainingSeconds: null,
      accessToken: null,
      parsedAccessToken: null,
      authenticated: null
    }
  },
  methods: {
    calculateExpiry(expires, now) {
      const remainingSeconds = expires - now;
      return remainingSeconds < 1 ? 0 : remainingSeconds;
    },
    updateTokenExpiryCallback() {
      setInterval(() => {
        const tokenExpires = this.parsedAccessToken.exp;
        const now = Math.round(new Date().getTime() / 1000);
        this.remainingSeconds = this.calculateExpiry(tokenExpires, now);
      }, 250)
    },
    updateToken() {
      Vue.$keycloak.updateToken(60).then(() => {
        this.setData();
      }).catch(() => {
        console.error("failed to update token");
      });
    },
    setData() {
      this.accessToken = Vue.$keycloak.token;
      this.parsedAccessToken = Vue.$keycloak.tokenParsed;
      this.authenticated = Vue.$keycloak.authenticated;
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
