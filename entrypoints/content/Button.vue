<script lang="ts" setup>
function onBuy() {
  console.log('Buy clicked!');
}
</script>

<template>
  <div style="padding-bottom: 10px;">
    <button class="button" style="width: 150px; height: 50px; font-size: 23;" @click="onBuy">Buy</button>
  </div>
</template>

<style scoped>
.container {
  pointer-events: auto;
  display: flex;
  width: 150px;
  height: 30px;
  background: rgb(255, 255, 255);
  border-radius: 8px;
  color: black;
}

.button {
  width: 150px !important;
  height: 30px !important;
  background: white;
  border-radius: 8px;
  color: black;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.button:hover {
  border-color: #646cff;
}
.button:focus,
.button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}
</style>