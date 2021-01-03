<template>
  <div>
    <p>Authenticated: {{ this.authenticated }}</p>
    <p>Access Token expires in: {{ this.accessTokenValidForSeconds }}</p>
    <p>Refresh Token expires in: {{ this.refreshTokenValidForSeconds }}</p>
    <button v-on:click="updateToken()">update token</button>
    <button v-on:click="logout()">logout</button>

    <div class="userinfo expiredTokenList">
      <div v-for="token in this.expiredTokens" :key="token.expired">
        <expired-token v-bind:expired="token.expired" v-bind:client="token.client" v-bind:name="token.name"></expired-token>
      </div>
    </div>

    <div class="row">
      <div class="column userinfo">
        <tree-view :data="userInfo"></tree-view>
      </div>
      <div class="column">
        <tree-view :data="idTokenParsed"></tree-view>
      </div>
    </div>

    <div class="row">
      <div class="column parsedtoken">
        <tree-view :data="parsedAccessToken"></tree-view>
      </div>

      <div class="column parsedtoken">
        <tree-view :data="parsedRefreshToken"></tree-view>
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
      refreshToken: null,
      parsedRefreshToken: null,
      idTokenParsed: null,
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

        this.accessTokenValidForSeconds = this.calculateExpiry(accessTokenExpires, now);
        this.refreshTokenValidForSeconds = this.calculateExpiry(refreshTokenExpires, now);

      }, 250)
    },
    updateToken() {
      Vue.$keycloak.updateToken(60).then(() => {
        this.expiredTokens.push({
          expired: this.parsedAccessToken.exp,
          name: this.parsedAccessToken.name,
          client: this.parsedAccessToken.azp
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
      // this.userInfo = Vue.$keycloak.userInfo;
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.userinfo {
  /*max-width: 500px;*/
  background: #1edbaf;
  height: 200px;
}

.parsedtoken {
  background: #598eb1;
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
