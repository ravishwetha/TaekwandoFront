import Vue from "vue"
import Router from "vue-router"
import StudentSummary from "@/views/StudentSummary"
import Login from "@/components/Login"
import NewLessonForm from "@/components/NewLessonForm"
import UserDetailsForm from "@/components/UserDetailsForm"
import AttendancePage from "@/views/AttendancePage"

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: "/",
      name: "home",
      component: StudentSummary,
    },
    {
      path: "/login",
      name: "login",
      component: Login,
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

router.beforeEach((to, from, next) => {
  if (to.name != "login") {
    const token = sessionStorage.getItem("token")
    if (token === null) {
      next({ name: "login" })
      // next("/login")
    } else {
      next()
    }
  }
  next()
})

export default router
