// assets
import { DashboardOutlined, UploadOutlined, BarChartOutlined } from '@ant-design/icons'; // ✅ Tambahkan icon yang relevan

// icons
const icons = {
  DashboardOutlined,
  UploadOutlined,
  BarChartOutlined // ✅ Tambahkan ke daftar icon
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: 'Navigation',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Quotation',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'applicantdata',
      title: 'Chatbot',
      type: 'item',
      url: '/dashboard/applicantdata',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'uploadcv',
      title: 'Upload',
      type: 'item',
      url: '/dashboard/upload-cv-manual', 
      icon: icons.UploadOutlined,
      breadcrumbs: false
    },
    {
      id: 'statistics',
      title: 'Statistics',
      type: 'item',
      url: '/dashboard/statistics', // ✅ URL sesuai route
      icon: icons.BarChartOutlined, // ✅ Gunakan icon statistik
      breadcrumbs: false
    }
  ]
};

export default dashboard;
