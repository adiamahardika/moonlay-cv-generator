import { RouterProvider } from 'react-router-dom';
import ThemeCustomization from 'themes';
import ScrollTop from 'components/ScrollTop';
import { KeycloakProvider } from 'services/hooks/usekeycloak.jsx';
// project import
import router from 'routes';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
    <KeycloakProvider>
      <ThemeCustomization>
        <ScrollTop>
          <RouterProvider router={router} />
        </ScrollTop>
      </ThemeCustomization>
    </KeycloakProvider>
  );
}
