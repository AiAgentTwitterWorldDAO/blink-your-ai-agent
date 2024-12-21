<script lang="ts" setup>
function onBuy() {
  console.log('Buy clicked!');
}
</script>

<template>
  <div class="container">
    <button type="button" @click="onBuy">Buy</button>
  </div>
</template>

<style scoped>
.container {
  pointer-events: auto;
  display: flex;
  background: white;
  border-radius: 8px;
  color: black;
}
</style>
