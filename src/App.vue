<template>
  <div id="app">
    <div v-if="authenticated">
      <AuthInfo/>
    </div>
    <div v-else>
      <h2>UNAUTHORISED!</h2>
    </div>
  </div>
</template>

<script>
import AuthInfo from './components/AuthInfo.vue'
import KeycloakHelper from '@/keycloak'
import Vue from 'vue';

export default {
  name: 'App',
  data() {
    return {
      keycloak: new KeycloakHelper("App.vue"),
    }
  },
  computed: {
    authenticated() {
      return Vue.$keycloak.authenticated;
    }
  },
  components: {
    AuthInfo
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
