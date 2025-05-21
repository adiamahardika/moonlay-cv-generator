import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Dashboard from 'layout/Dashboard';

const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/index')));
const ChatBot = Loadable(lazy(() => import('pages/dashboard/chatbot')));
const UploadCVManual = Loadable(lazy(() => import('pages/dashboard/Upload'))); // ✅ tambahan baru
const StatisticsPage = Loadable(lazy(() => import('pages/dashboard/StatisticsPage'))); // ✅ import baru

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <Dashboard />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'color',
      element: <Color />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        },
        {
          path: 'applicantdata',
          element: <ChatBot />
        },
        {
          path: 'upload-cv-manual',
          element: <UploadCVManual /> // ✅ route baru
        },
        {
          path: 'statistics', // Menambahkan route untuk statistik
          element: <StatisticsPage /> // Menghubungkan ke StatisticsPage
        }
      ]
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    },
    {
      path: 'shadow',
      element: <Shadow />
    },
    {
      path: 'typography',
      element: <Typography />
    }
  ]
};

export default MainRoutes;
