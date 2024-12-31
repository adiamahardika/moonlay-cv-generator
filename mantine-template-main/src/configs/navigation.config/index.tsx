import type {NavigationTree} from '@/@types/navigation';
import {  IconMessage, IconFileAnalytics } from '@tabler/icons-react';

const navigationConfig: NavigationTree[] = [
  {
    key: 'MoonlayAI',
    path: '/MoonlayAI',
    title: 'Moonlay AI',
    translateKey: '',
    icon: IconMessage,
    authority: [],
    subMenu: [],
  },
  {
    key: 'applicantdata',
    path: '/applicantdata',
    title: 'Application Data',
    translateKey: '',
    icon: IconFileAnalytics,
    authority: [],
    subMenu: [],
  },
];

export default navigationConfig;
