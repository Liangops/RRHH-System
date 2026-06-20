<script setup>
</script>

<template>

    <nav class="sidebar" id="sidebar">

        <router-link to="/empleado" class="nav-item" active-class="nav-item-active">
            <i class="ti ti-users"></i>
            Empleados
        </router-link>

        <router-link to="/departamento" class="nav-item" active-class="nav-item-active">
            <i class="ti ti-building"></i>
            Departamentos
        </router-link>

        <router-link to="/expedientes" class="nav-item" active-class="nav-item-active">
            <i class="ti ti-folder"></i>
            Expedientes
        </router-link>

        <router-link to="/permisos-vacaciones" class="nav-item" active-class="nav-item-active">
            <i class="ti ti-calendar-off"></i>
            Permisos y Vacaciones
        </router-link>

        <router-link to="/asistencia" class="nav-item" active-class="nav-item-active">
            <i class="ti ti-clock"></i>
            Asistencia
        </router-link>

        <router-link to="/nomina" class="nav-item" active-class="nav-item-active">
            <i class="ti ti-cash"></i>
            Nomina
        </router-link>

        <router-link to="/capacitaciones" class="nav-item" active-class="nav-item-active">
            <i class="ti ti-school"></i>
            Capacitaciones
        </router-link>

        <div class="sidebar-section"> Conocimiento </div>
        <router-link to="/basedeconocimiento" class="nav-item" active-class="nav-item-active">
            <i class="ti ti-books"></i>
            Base de conocimiento
        </router-link>

        <router-link to="/chatia" class="nav-item" active-class="nav-item-active">
            <i class="ti ti-sparkles"></i>
            Asistente IA
        </router-link>

        <div class="sidebar-section"> Sistema </div>
        <router-link to="/reportes" class="nav-item" active-class="nav-item-active">
            <i class="ti ti-chart-bar"></i>
            Reportes
        </router-link>

        <router-link to="/auditoria" class="nav-item" active-class="nav-item-active">
            <i class="ti ti-shield-check"></i>
            Auditoria
        </router-link>

        <router-link to="/facturacionelectronica" class="nav-item" active-class="nav-item-active">
            <i class="ti ti-receipt"></i>
            Facturación electrónica
        </router-link>

        <router-link to="/suscripciones" class="nav-item" active-class="nav-item-active">
            <i class="ti ti-star"></i>
            Suscripciones
        </router-link>

        <router-link to="/configuracion" class="nav-item" active-class="nav-item-active">
            <i class="ti ti-settings"></i>
            Configuración
        </router-link>
 
        <div class="nav-item" style="margin-top: 20px;color:rgba(255, 100, 100, .7)">
            <i class="ti ti-logout">
               
            </i>
            Cerra sesión
        </div>

    </nav>

</template>

<style>

@import url(../assets/styles/base.css);

.nav-item-active {
    background: rgba(91, 196, 160, .13);
    color: #5bc4a0;
    border-left: 30px solid #5bc4a0;
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
    text-decoration: none;
}

.nav-item:hover {
    background: rgba(255,255,255,.05);
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

.sidebar-section {
    padding: 10px 18px 3px;
    font-size: 10.5px;
    color: rgba(255, 255, 255, .3);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 6px;
}

</style>