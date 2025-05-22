import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ThemeCustomization from 'themes';
import ScrollTop from 'components/ScrollTop';
import { KeycloakProvider } from 'services/hooks/usekeycloak.jsx';
// project import
import MainRoutes from 'routes/MainRoutes';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  const mapRoutes = (routes) => {
    return routes.map((route) => {
      if (route.children && route.children.length > 0) {
        return (
          <Route key={route.path} path={route.path} element={route.element}>
            {mapRoutes(route.children)}
          </Route>
        );
      }
      return <Route key={route.path} path={route.path} element={route.element} />;
    });
  };

  return (
    <KeycloakProvider>
      <ThemeCustomization>
        <ScrollTop>
          <BrowserRouter>
            <Routes>
              <Route path={MainRoutes.path} element={MainRoutes.element}>
                {mapRoutes(MainRoutes.children)}
              </Route>
            </Routes>
          </BrowserRouter>
        </ScrollTop>
      </ThemeCustomization>
    </KeycloakProvider>
  );
}
