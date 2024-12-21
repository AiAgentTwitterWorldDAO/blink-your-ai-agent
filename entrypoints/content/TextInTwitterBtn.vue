<script setup lang="ts">

onMounted(async () => {
  // tabId = await sendMessage("getTabId", {}, "background");
  console.log('====> content-script onMounted get tabId :')
});

// let nftItemPath = $(inject("nftItemPath"));

const openLink = async () => {
  console.log('====> openLink clicked!')
  // const url = `/options/${nftItemPath}`
  // await sendMessage('openOption', { url }, 'background')
}
</script>

<template>
  <div style="display: flex; margin-bottom: 15px; flex-direction: column; align-items: center; ">
    <div style="display: flex; background-color: #ffffff; width: 360px; height: 180px; align-items: center;">
        <button style="display:flex; margin-left: 15px; align-items: center; justify-content: center; width: 150px; height: 50px; font-size: 18;"
            @click="openLink">
            Mint 1 NFT Pass
        </button>
        <div style="display: flex; color:black; margin-left: 5px; margin-right: 5px"> Or </div>
        <button style="display: flex; align-items: center; justify-content: center; width: 150px; height: 50px; font-size: 18;"
            @click="openLink">
            Mint 1 OTP-SBT
        </button>
    </div>
</div>
</template>

<style scoped>
button {
  background-color: #646cff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

div {
  color: white;
}
</style>
