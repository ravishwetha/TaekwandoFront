import Vue from "vue"
import Router from "vue-router"
import Attendance from "@/views/AttendancePage"
import Login from "@/components/Login"
import NewLessonForm from "@/components/NewLessonForm"

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: "/",
      name: "home",
      component: NewLessonForm,
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "./views/About.vue"),
    },
  ],
})
