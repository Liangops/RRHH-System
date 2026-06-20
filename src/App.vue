<script setup>
import SideBar from './components/sideBar.vue'
import TopBar from './components/topBar.vue'

</script>

<template>
<TopBar/>

<div class="layout">
  <SideBar/>
  <main class="content">
    <router-view/>
    
  </main>
</div>

</template>