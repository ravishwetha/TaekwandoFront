import Vue from "vue"
import Router from "vue-router"
import StudentSummary from "@/views/StudentSummary/StudentSummary"
import Login from "@/components/Login"
import NewLessonForm from "@/components/NewLessonForm"
import UserDetailsForm from "@/components/UserDetailsForm"
import AttendancePage from "@/views/AttendancePage"
import SignupForm from "@/views/UserSignupForm"

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: "/signup",
      name: "signup",
      component: SignupForm,
    },
    {
      path: "/",
      name: "home",
      component: StudentSummary,
    },
    {
      path: "/edit",
      name: "edit",
      component: SignupForm,
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
      console.log("token is null")
      next({ name: "login" })
      return
    }
  }
  next()
})

export default router
