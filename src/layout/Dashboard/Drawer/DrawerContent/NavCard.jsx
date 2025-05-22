import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import AnimateButton from 'components/@extended/AnimateButton';
import { useKeycloakAuth } from 'services/hooks/usekeycloak.jsx';
import MainCard from 'components/MainCard';
import Typography from 'themes/typography';

export default function NavCard({ drawerOpen }) {
  const { keycloak, isAuthenticated, username } = useKeycloakAuth(); // Access Keycloak context
  console.log(keycloak, isAuthenticated, username);

  const handleLogout = () => {
    if (keycloak) {
      keycloak.logout({
        redirectUri: window.location.origin // Make sure it's correctly set
      });
    }
  };

  return (
    <MainCard
      sx={{
        bgcolor: 'grey.50',
        m: 3,
        position: 'fixed',
        bottom: 0,
        width: drawerOpen ? '10%' : 0, // Adjust width or visibility
        transition: 'width 0.3s ease, opacity 0.3s ease',
        opacity: drawerOpen ? 1 : 0, // Optionally fade out
        overflow: 'hidden' // Prevent content overflow when minimized
      }}
    >
      <Stack alignItems="start" spacing={2.5}>
        {username}
        <AnimateButton>
          <Button onClick={handleLogout} variant="contained" color="success" size="small">
            Logout
          </Button>
        </AnimateButton>
      </Stack>
    </MainCard>
  );
}
