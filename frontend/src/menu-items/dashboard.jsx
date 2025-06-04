// assets
import { DashboardOutlined, UploadOutlined } from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined,
  UploadOutlined 
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
  id: 'skill-statistics',
  title: 'Skill Statistics',
  type: 'item',
  url: '/dashboard/skill-statistics',
  icon: icons.DashboardOutlined,
  breadcrumbs: false
}
  ]
};

export default dashboard;
