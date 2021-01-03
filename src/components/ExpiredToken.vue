<template>
  <div>
    <p> {{ this.name }} - {{ hours + ":" + minutes + ":" + seconds }} - {{ this.client }}</p>
  </div>
</template>

<script>
export default {
  name: 'ExpiredToken',
  props: [
    'expired',
    'name',
    'client'
  ],
  data() {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0
    }
  },
  mounted() {
    const date = new Date(this.expired);
    console.log(this.expired)
    this.hours = date.getHours();
    this.minutes = date.getMinutes();
    this.seconds = date.getSeconds();
  },
}
</script>

<style>

</style>