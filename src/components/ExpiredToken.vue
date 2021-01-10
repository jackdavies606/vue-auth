<template>
  <div class="row">
    <div class="column">{{ this.type }}</div>
    <div class="column">issued({{ this.iss.hours }}:{{ this.iss.minutes }}:{{this.iss.seconds}})</div>
    <div class="column">expired({{ this.exp.hours }}:{{ this.exp.minutes }}:{{this.exp.seconds}})</div>
  </div>
</template>

<script>
export default {
  name: 'ExpiredToken',
  props: [
    'expired',
    'type',
    'issuedAt'
  ],
  data() {
    return {
      exp: {
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      iss: {
        hours: 0,
        minutes: 0,
        seconds: 0
      }
    }
  },
  mounted() {
    const dateExp = new Date(this.expired * 1000);
    this.exp.hours = dateExp.getUTCHours();
    this.exp.minutes = dateExp.getUTCMinutes();
    this.exp.seconds = dateExp.getUTCSeconds();

    const dateIss = new Date(this.issuedAt * 1000);
    this.iss.hours = dateIss.getUTCHours();
    this.iss.minutes = dateIss.getUTCMinutes();
    this.iss.seconds = dateIss.getUTCSeconds();
  },
}
</script>

<style scoped>
  .column {
    width: 130px;
  }

  .row {
    margin: auto;
    width: fit-content;
  }

  .row:hover {
    color: black;
  }
</style>