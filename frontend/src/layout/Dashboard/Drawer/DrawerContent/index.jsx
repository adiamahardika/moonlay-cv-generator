// project import
import NavCard from './NavCard';
import Navigation from './Navigation';
import SimpleBar from 'components/third-party/SimpleBar';
import { Box } from '@mui/system';

// ==============================|| DRAWER CONTENT ||============================== //

export default function DrawerContent({ drawerOpen }) {
  return (
    <>
      <SimpleBar sx={{ '& .simplebar-content': { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' } }}>
        <Navigation />
        <NavCard drawerOpen={drawerOpen} />
      </SimpleBar>
    </>
  );
}