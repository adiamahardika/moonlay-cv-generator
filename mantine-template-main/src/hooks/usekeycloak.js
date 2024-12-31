import { useState, useEffect } from 'react';
import Keycloak from 'keycloak-js';

export const Usekeycloak = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(null);
  const [keycloak, setKeycloak] = useState(null); // State for Keycloak instance

  useEffect(() => {
    async function initializeKeycloak() {
      try {
        const kc = new Keycloak({
          url: import.meta.env.VITE_KEYCLOAK_URL,
          realm: import.meta.env.VITE_KEYCLOAK_REALM,
          clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
        });

        const authenticated = await kc.init({
          onLoad: 'login-required',
          redirectUri: import.meta.env.VITE_KEYCLOAK_REDIRECT_URI,
          checkLoginIframe: false,
          rememberMe: true,
        });

        // If authenticated, set Keycloak, username, and authentication status
        if (authenticated) {
          const user = kc.tokenParsed.preferred_username;
          setUsername(user);
          setIsAuthenticated(true);
        }

        setKeycloak(kc); // Set Keycloak instance in state after initialization
      } catch (error) {
        console.error('Keycloak initialization failed:', error);
      }
    }

    initializeKeycloak();
  }, []);

  return { isAuthenticated, username, keycloak };
};
