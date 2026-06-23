import { createRouter, createWebHistory } from "vue-router";

import loginView from "../views/loginView.vue";
import empleadoView from "../views/empleadoView.vue";
import departamentoView from "../views/departamentoView.vue";
import expedienteView from "../views/expedienteView.vue";
import permisosvacacioneView from "../views/permisosvacacioneView.vue";
import asistenciaView from "../views/asistenciaView.vue";
import nominaView from "../views/nominaView.vue";
import capacitacionesView from "../views/capacitacionesView.vue";
import reportesView from "../views/reportesView.vue";
import dashboardView from "../views/dashboardView.vue";
import superadminView from "../views/superadminView.vue";
import configuracionView from "../views/confiView.vue";


const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "login",
    component: loginView,
    meta: { publica: true },
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: dashboardView,
    meta: { requiereAuth: true },
  },
  {
    path: "/superadmin",
    name: "superadmin",
    component: superadminView,
    meta: { requiereAuth: true, rol: "superadmin" },
  },
  {
    path: "/empleado",
    name: "empleado",
    component: empleadoView,
    meta: { requiereAuth: true },
  },
  {
    path: "/departamento",
    name: "departamento",
    component: departamentoView,
    meta: { requiereAuth: true },
  },
  {
    path: "/expedientes",
    name: "expedientes",
    component: expedienteView,
    meta: { requiereAuth: true },
  },
  {
    path: "/permisos-vacaciones",
    name: "permisos-vacaciones",
    component: permisosvacacioneView,
    meta: { requiereAuth: true },
  },
  /*
  {
    path: "/asistencia",
    name: "asistencia",
    component: asistenciaView,
    meta: { requiereAuth: true },
  },
  {
    path: "/nomina",
    name: "nomina",
    component: nominaView,
    meta: { requiereAuth: true },
  },
  */
  {
    path: "/capacitaciones",
    name: "capacitaciones",
    component: capacitacionesView,
    meta: { requiereAuth: true },
  },
  {
    path: "/reportes",
    name: "reportes",
    component: reportesView,
    meta: { requiereAuth: true },
  },
  {
    path: "/configuracion",
    name: "configuracion",
    component: configuracionView,
    meta: { requiereAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");


  if (to.meta.publica) return next();


  if (to.meta.requiereAuth && !token) return next("/login");


  if (to.meta.rol && usuario?.rol !== to.meta.rol) {
    
    return next("/dashboard");
  }

  next();
});

export default router;