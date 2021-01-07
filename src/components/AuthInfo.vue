<template>
  <div>
    <button class="button" v-on:click="updateToken()">update token</button>
    <button class="button" v-on:click="logout()">logout</button>

    <div class="expiredTokenList">
      <div v-for="token in this.expiredTokens" :key="token.expired">
        <expired-token v-bind:expired="token.expired" v-bind:client="token.client" v-bind:name="token.name" v-bind:type="token.type"></expired-token>
      </div>
    </div>

    <div class="table">
      <div class="row primaryRow">
        <div class="column">
          <h3>Access Token: expires in {{ this.accessTokenValidForSeconds }}</h3>
          <tree-view :data="parsedAccessToken"></tree-view>
        </div>

        <div class="column">
          <h3>ID Token: expires in {{ this.idTokenValidForSeconds }}</h3>
          <tree-view :data="idTokenParsed"></tree-view>
        </div>
      </div>

      <div class="row secondaryRow">
        <div class="column">
          <h3>User Info</h3>
          <tree-view :data="userInfo"></tree-view>
        </div>
        <div class="column">
          <h3>Refresh Token: expires in {{ this.refreshTokenValidForSeconds }}</h3>
          <tree-view :data="parsedRefreshToken"></tree-view>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import Vue from 'vue';
import { EventBus } from '@/../event-bus.js';
import { TreeView } from "vue-json-tree-view"
import ExpiredToken from '@/components/ExpiredToken'

export default {
  name: 'AuthInfo',
  components: {
    TreeView,
    ExpiredToken
  },
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
      accessToken: null,
      parsedAccessToken: null,
      accessTokenValidForSeconds: null,
      idTokenParsed: null,
      idTokenValidForSeconds: null,
      refreshToken: null,
      parsedRefreshToken: null,
      refreshTokenValidForSeconds: null,
      authenticated: null,
      userInfo: null,
      expiredTokens: []
    }
  },
  methods: {
    calculateExpiry(expires, now) {
      const remainingSeconds = expires - now;
      return remainingSeconds < 1 ? 0 : remainingSeconds;
    },
    updateTokenExpiryCallback() {
      setInterval(() => {
        const now = Math.round(new Date().getTime() / 1000);
        const accessTokenExpires = this.parsedAccessToken.exp;
        const refreshTokenExpires = this.parsedRefreshToken.exp;
        const idTokenExpires = this.idTokenParsed.exp;

        this.accessTokenValidForSeconds = this.calculateExpiry(accessTokenExpires, now);
        this.idTokenValidForSeconds = this.calculateExpiry(idTokenExpires, now);
        this.refreshTokenValidForSeconds = this.calculateExpiry(refreshTokenExpires, now);
      }, 250)
    },
    updateToken() {
      Vue.$keycloak.updateToken(60).then(() => {
        this.expiredTokens.push({
          expired: this.parsedAccessToken.exp,
          name: this.parsedAccessToken.name,
          client: this.parsedAccessToken.azp,
          type: this.parsedAccessToken.typ
        })
        this.setData();
      }).catch(() => {
        console.error("failed to update token");
      });
    },
    getUserInfo() {
      Vue.$keycloak.loadUserInfo().then(() => {
        console.log("user info call success");
        this.userInfo = Vue.$keycloak.userInfo;
      }).catch(() => {
        console.error("failed to get user info");
      });
    },
    logout() {
      Vue.$keycloak.logout();
    },
    setData() {
      this.accessToken = Vue.$keycloak.token;
      this.parsedAccessToken = Vue.$keycloak.tokenParsed;
      this.authenticated = Vue.$keycloak.authenticated;
      this.refreshToken = Vue.$keycloak.refreshToken;
      this.parsedRefreshToken = this.parseJwt(this.refreshToken);
      this.idTokenParsed = Vue.$keycloak.idTokenParsed;
      this.getUserInfo();
    },
    parseJwt (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    }
  },
}
</script>

<style>
.table {
  margin: auto;
  width: fit-content;
  max-width: 1000px;
  padding: 5px;
}

.primaryRow {
  background: #598eb1;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.secondaryRow {
  background: #1edbaf;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.expiredTokenList {
  max-width: 800px;
  border-top-right-radius: 20px;
  background: cadetblue;
  height: 200px;
  max-height: 200px;
  margin: auto;
}

.button{
  display:inline-block;
  padding:0.4em 1.5em;
  margin:0 0.3em 0.3em 0;
  border-radius:2em;
  box-sizing: border-box;
  text-decoration:none;
  font-family:'Roboto',sans-serif;
  font-weight:500;
  font-size: 1.2em;
  color:#FFFFFF;
  background-color:#4eb5f1;
  text-align:center;
  transition: all 0.2s;
  border: none;
}
.button:hover{
  background-color:#4095c6;
}

/* The Tree View should only fill out available space, scroll when
   necessary.
*/
.tree-view-item {
  font-family: monospace;
  font-size: 14px;
  margin-left: 18px;
}

.tree-view-wrapper {
  overflow: auto;
}

/* Find the first nested node and override the indentation */
.tree-view-item-root > .tree-view-item-leaf > .tree-view-item {
  margin-left: 0;
}

/* Root node should not be indented */
.tree-view-item-root {
  margin-left: 0;
}

.tree-view-item-node {
  cursor: pointer;
  position: relative;
  white-space: nowrap;
}

.tree-view-item-leaf {
  white-space: nowrap;
}

.tree-view-item-key {
  font-weight: bold;
}

.tree-view-item-key-with-chevron {
  padding-left: 14px;
}


.tree-view-item-key-with-chevron.opened::before {
  top:4px;
  transform: rotate(90deg);
  -webkit-transform: rotate(90deg);
}

.tree-view-item-key-with-chevron::before {
  color: #444;
  content: '\25b6';
  font-size: 10px;
  left: 1px;
  position: absolute;
  top: 3px;
  transition: -webkit-transform .1s ease;
  transition: transform .1s ease;
  transition: transform .1s ease, -webkit-transform .1s ease;
  -webkit-transition: -webkit-transform .1s ease;
}

.tree-view-item-hint {
  color: #ccc
}


* {
  box-sizing: border-box;
}

/* Create two equal columns that floats next to each other */
.column {
  float: left;
  width: 50%;
  padding: 10px;
  max-width: 800px;
  border-radius: 20px;
  padding-right: 5px;
  /*height: 300px; !* Should be removed. Only for demonstration *!*/
}

.column:hover {
  color: black;
}

/* Clear floats after the columns */
.row:after {
  content: "";
  display: table;
  clear: both;
}

.expiredTokenList {
  /*height: 100px;*/
  /*width: 500px;*/
  overflow-y: auto;
  /*background: cadetblue;*/
  border-radius: 20px;
}
</style>
