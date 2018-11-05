import Vue from "vue"
import Router from "vue-router"
import StudentSummary from "@/views/StudentSummary"
import Login from "@/components/Login"
import NewLessonForm from "@/components/NewLessonForm"
import UserDetailsForm from "@/components/UserDetailsForm"
import AttendancePage from "@/views/AttendancePage"

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: "/",
      name: "home",
      component: StudentSummary,
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
    {
      path: "/userDetails",
      name: "userDetails",
      component: UserDetailsForm,
    },
    {
      path: "/attendance",
      name: "attendance",
      component: AttendancePage,
    },
    {
      path: "/newLesson",
      name: "newLesson",
      component: NewLessonForm,
    },
  ],
})
