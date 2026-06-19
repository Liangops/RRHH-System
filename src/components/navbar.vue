<script setup>

import { ref } from 'vue';

const menuActivo = ref('')

const seleccionar = (menu) => {
    menuActivo.value = menu;
}

</script>

<template>

    <nav class="sidebar" id="sidebar">
        <div class="nav-item"  v-on:click="seleccionar('empleados')" :class="{'nav-item-active': menuActivo === 'empleados'}" >
            <i class="ti ti-users">

            </i>
            Empleados
        </div>

         <div class="nav-item" v-on:click="seleccionar('departamentos')" :class="{'nav-item-active': menuActivo === 'departamentos'}" >
            <i class="ti ti-building">
            </i>
            Departamentos
         </div>

         <div class="nav-item" @click="seleccionar('expedientes')" :class="{'nav-item-active': menuActivo === 'expedientes'}" >
            <i class="ti ti-folder">
           
            </i>
            Expedientes
         </div>

         <div class="nav-item" @click="seleccionar('permisos-vacaciones')" :class="{'nav-item-active': menuActivo === 'permisos-vacaciones'}"  >
            <i class="ti ti-calendar-off">
            </i>
            Permisos y Vacaciones
         </div>

         <div class="nav-item" @click="seleccionar('asistencia')" :class="{'nav-item-active': menuActivo === 'asistencia'}" >
            <i class="ti ti-clock">
            
            </i>
            Asistencia          
         </div>

         <div class="nav-item" @click="seleccionar('nomina')" :class="{'nav-item-active': menuActivo === 'nomina'}">
            <i class="ti ti-cash">
            </i>
            Nomina         
         </div>

         <div class="nav-item" @click="seleccionar('capacitaciones')" :class="{'nav-item-active': menuActivo === 'capacitaciones'}">
            <i class="ti ti-school">
             </i>
            Capacitaciones        
         </div>

         <div class="nav-item" @click="seleccionar('beneficios')" :class="{'nav-item-active': menuActivo === 'beneficios'}">
            <i class="ti ti-gift">
            </i>
            Beneficios         
         </div>

         <div class="nav-item" @click="seleccionar('vacantes')" :class="{'nav-item-active': menuActivo === 'vacantes'}">
            <i class="ti ti-briefcase">
            </i>
            Vacantes     
         </div>

         <div class="nav-item" @click="seleccionar('reclutamiento')" :class="{'nav-item-active': menuActivo === 'reclutamiento'}">
            <i class="ti ti-search">
            </i>
            Reclutamiento      
         </div>
        
         
         

    </nav>

</template>

<style>

@import url(../assets/styles/base.css);

.nav-item-active {
    background: rgba(91, 196, 160, .13);
    color: #5bc4a0;
    border-left: 3px solid #5bc4a0;
}

.nav {
    display: block;
    unicode-bidi: isolate;
}

.sidebar {
    width: 218px;
    background: #122b44;
    position: fixed;
    top: 54px;
    bottom: 0;
    left: 0;
    overflow-y: auto;
    padding: 14px 0;
    z-index: 90;
}

.nav-item {
display: flex;
align-items: center;
gap: 10px;
padding: 9px 18px;
cursor: pointer;
color: rgba(255, 255, 255, .6);
font-size: 13.5px;
border-left: 3px solid transparent;
transition: all .15s;
user-select: none;
}

.nav-item i {
    font-size: 17px;
    flex-shrink: 0;
}

.ti {
    font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    sans-serif;
    speak-as: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    -wekit-font-smoothing: antialiased;
}


</style>