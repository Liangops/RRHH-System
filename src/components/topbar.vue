<script setup>

</script>

<template>
    <header class="topbar">
        <i  class="ti ti-brain" style="color:#5bc4a0;font-size:22px ;"></i> 
        <span class="topbar-logo">
            Grupo M
            <span>RRHH System IA</span>

         </span>
         <div class="topbar-right">
            <i class="ti ti-bell notif"></i>
            <div class="avatar">JA</div>
         </div>
    </header>

</template>

<style>

.topbar {
    background: #1a3c5e;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 24px;
    height: 54px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
}

header {
    display: block;
    unicode-bidi: isolate;
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
    font-style: none;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    -webkit-font-smoothing: antialiased;
}

.topbar-logo {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: .3px;
}

.topbar-logo span {
    color: #5bc4a0;
    font-weight: 400;
}
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

.topbar-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 18px;
}
.topbar-right .notif {
    color: rgba(255, 255, 255, .7);
    font-size: 20px;
    cursor: pointer;
}

.topbar-right .avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #5bc4a0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: #04342c;
    cursor: pointer;
}

</style>