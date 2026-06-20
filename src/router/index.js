import { createRouter, createWebHistory } from "vue-router";

import empleadoView from "../views/empleadoView.vue";
import departamentoView from "../views/departamentoView.vue";
import expedienteView from "../views/expedienteView.vue"
import permisosvacacioneView from "../views/permisosvacacioneView.vue";
import asistenciaView from "../views/asistenciaView.vue";
import nominaView from "../views/nominaView.vue";
import capacitacionesView from "../views/capacitacionesView.vue";
import reportesView from "../views/reportesView.vue";

const routes = [
    {
        path: '/',
        redirect: '/empleado'
    },
    {
        path: '/empleado',
        name: 'empleado',
        component: empleadoView
    },
    {
        path: '/departamento',
        name: 'departamento',
        component: departamentoView
    },

     
    {
        path: '/expedientes',
        name: 'expedientes',
        component: expedienteView
    },
    
    {
        path: '/permisos-vacaciones',
        name: 'permisos-vacaciones',
        component: permisosvacacioneView
    },
    
    {
        path: '/asistencia',
        name: 'asistencia',
        component: asistenciaView
    },
    
    {
        path: '/nomina',
        name: 'nomina',
        component: nominaView
    },
    
    {
        path: '/capacitaciones',
        name: 'capacitaciones',
        component: capacitacionesView
    },
    {
        path: '/reportes',
        name: 'reportes',
        component: reportesView
    }
    /*
    {
        path: '/basedeconocimiento',
        name: 'basedeconocimiento',
        component: departamentoView
    },
    {
        path: '/chatia',
        name: 'chatia',
        component: departamentoView
    },
    */

    
    
    
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;