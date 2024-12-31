import { lazy } from 'react'
import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes = [
  {
    key: 'MoonlayAI',
    path: '/MoonlayAI',
    component: lazy(() => import('@/pages/MoonlayAI')),
    authority: [],
  },
  {
    key: 'applicantdata',
    path: '/applicantdata',
    component: lazy(() => import('@/pages/applicantdata')),
    authority: [],
  },
  {
    key: 'pages',
    path: '/dashboard/pages',
    component: lazy(() => import('@/pages/Pages')),
    authority: [],
  },
  {
    key: 'files',
    path: '/dashboard/files',
    component: lazy(() => import('@/pages/Files')),
    authority: [],
  },
  {
    key: 'manage',
    path: '/users/manage',
    component: lazy(() => import('@/pages/auth/Manage')),
    authority: [],
  },
];
