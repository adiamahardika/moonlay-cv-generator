import '@mantine/core/styles.css';
import {MantineProvider} from '@mantine/core';
import {theme} from './theme';
import {Layout} from "@/components/Layout/Layout";
import {Provider} from "react-redux";
import store, {persistor} from "@/store";
import {PersistGate} from "redux-persist/integration/react";
import {BrowserRouter} from "react-router-dom";
import appConfig from './configs/app.config';
 //@ts-ignore
import { Usekeycloak } from './hooks/usekeycloak.js';

export default function App() {

  // Use the keycloak hook
  const { isAuthenticated, username, keycloak } = Usekeycloak();


  /**
   * Set enableMock(Default true) to true at configs/app.config.js
   * If you wish to enable mock api
   */

  return (
    <MantineProvider theme={theme}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            {/* Conditionally render the app based on authentication */}
            {isAuthenticated ? (
              <Layout username={username} keycloak={keycloak} /> // Pass username if needed
            ) : (
              <div>Redirecting to login...</div>
            )}
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </MantineProvider>
  );
}
