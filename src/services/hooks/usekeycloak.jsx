import React, { createContext, useContext, useState, useEffect } from 'react';
import Keycloak from 'keycloak-js';

// Create the Keycloak context
const KeycloakContext = createContext();

// Custom hook to access the Keycloak context
export const useKeycloakAuth = () => {
  return useContext(KeycloakContext);
};

// KeycloakProvider to wrap the app and provide the context
export const KeycloakProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(null);
  const [keycloak, setKeycloak] = useState(null);

  useEffect(() => {
    async function initializeKeycloak() {
      try {
        const kc = new Keycloak({
          url: import.meta.env.VITE_KEYCLOAK_URL,
          realm: import.meta.env.VITE_KEYCLOAK_REALM,
          clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID
        });

        const authenticated = await kc.init({
          onLoad: 'login-required',
          // redirectUri: import.meta.env.VITE_KEYCLOAK_REDIRECT_URI,
          checkLoginIframe: false,
          rememberMe: true
        });

        if (authenticated) {
          const user = kc.tokenParsed.preferred_username;
          setUsername(user);
          setIsAuthenticated(true);
        }

        setKeycloak(kc);
      } catch (error) {
        console.error('Keycloak initialization failed:', error);
      }
    }

    initializeKeycloak();
  }, []);

  return <KeycloakContext.Provider value={{ isAuthenticated, username, keycloak }}>{children}</KeycloakContext.Provider>;
};
