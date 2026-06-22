<script setup>
import SideBar from './components/sideBar.vue'
import TopBar from './components/topBar.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const rutasSinLayout = ['/login', '/superadmin']
const mostrarLayout = computed(() => !rutasSinLayout.includes(route.path))
</script>

<template>
  <TopBar v-if="mostrarLayout"/>

  <div :class="mostrarLayout ? 'layout' : ''">
    <SideBar v-if="mostrarLayout"/>
    <main :class="mostrarLayout ? 'content' : ''">
      <router-view/>
    </main>
  </div>
</template>