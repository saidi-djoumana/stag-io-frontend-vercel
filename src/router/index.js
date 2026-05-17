import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

// Student
import StudentDashboard from '../views/student/StudentDashboard.vue'
import DigitalCV from '../views/student/DigitalCV.vue'
import AcceptedInternships from '../views/student/AcceptedInternships.vue'

// Company
import CompanyDashboard from '../views/company/CompanyDashboard.vue'
import CompanyProfile from '../views/company/CompanyProfile.vue'
import CompanyOffers from '../views/company/CompanyOffers.vue'
import Candidates from '../views/company/Candidates.vue'

// Admin
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import InternshipValidations from '../views/admin/InternshipValidations.vue'
import Agreements from '../views/admin/Agreements.vue'
import CompanyApprovals from '../views/admin/companyApprovals.vue'

const getMainDashboardByRole = (role) => {
  switch (role) {
    case 'student':
      return '/student/dashboard'
    case 'company':
      return '/company/dashboard'
    default:
      return '/login'
  }
}

const getAdminDashboard = () => '/admin/dashboard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },

    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true, authScope: 'main' },
    },
    {
      path: '/admin',
      name: 'admin-login',
      component: LoginView,
      meta: { guestOnly: true, adminLogin: true, authScope: 'admin' },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { guestOnly: true, authScope: 'main' },
    },

    {
      path: '/student/dashboard',
      name: 'student-dashboard',
      component: StudentDashboard,
      meta: { requiresAuth: true, role: 'student', authScope: 'main' },
    },
    {
      path: '/student/digital-cv',
      name: 'student-digital-cv',
      component: DigitalCV,
      meta: { requiresAuth: true, role: 'student', authScope: 'main' },
    },
    {
      path: '/student/accepted-internships',
      name: 'student-accepted-internships',
      component: AcceptedInternships,
      meta: { requiresAuth: true, role: 'student', authScope: 'main' },
    },

    {
      path: '/company/dashboard',
      name: 'company-dashboard',
      component: CompanyDashboard,
      meta: { requiresAuth: true, role: 'company', authScope: 'main' },
    },
    {
      path: '/company/profile',
      name: 'company-profile',
      component: CompanyProfile,
      meta: { requiresAuth: true, role: 'company', authScope: 'main' },
    },
    {
      path: '/company/offers',
      name: 'company-offers',
      component: CompanyOffers,
      meta: { requiresAuth: true, role: 'company', authScope: 'main' },
    },
    {
      path: '/company/candidates',
      name: 'company-candidates',
      component: Candidates,
      meta: { requiresAuth: true, role: 'company', authScope: 'main' },
    },

    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: AdminDashboard,
      meta: { requiresAuth: true, role: 'admin', authScope: 'admin' },
    },
    {
      path: '/admin/company-approvals',
      name: 'admin-company-approvals',
      component: CompanyApprovals,
      meta: { requiresAuth: true, role: 'admin', authScope: 'admin' },
    },
    {
      path: '/admin/internship-validations',
      name: 'admin-internship-validations',
      component: InternshipValidations,
      meta: { requiresAuth: true, role: 'admin', authScope: 'admin' },
    },
    {
      path: '/admin/agreements',
      name: 'admin-agreements',
      component: Agreements,
      meta: { requiresAuth: true, role: 'admin', authScope: 'admin' },
    },

    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

router.beforeEach((to, from, next) => {
  const mainToken = localStorage.getItem('token')
  const mainRole = localStorage.getItem('role')

  const adminToken = localStorage.getItem('admin_token')
  const adminRole = localStorage.getItem('admin_role')

  const isAdminRoute = to.meta.authScope === 'admin'
  const currentToken = isAdminRoute ? adminToken : mainToken
  const currentRole = isAdminRoute ? adminRole : mainRole

  if (to.meta.requiresAuth && !currentToken) {
    if (isAdminRoute) return next('/admin')
    return next('/login')
  }

  if (to.meta.guestOnly) {
    if (isAdminRoute && adminToken) {
      return next(getAdminDashboard())
    }

    if (!isAdminRoute && mainToken) {
      return next(getMainDashboardByRole(mainRole))
    }
  }

  if (to.meta.requiresAuth && currentToken && to.meta.role && currentRole !== to.meta.role) {
    if (isAdminRoute) return next(getAdminDashboard())
    return next(getMainDashboardByRole(mainRole))
  }

  next()
})

export default router