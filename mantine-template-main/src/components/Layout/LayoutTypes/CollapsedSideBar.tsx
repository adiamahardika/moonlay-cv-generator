import React, { useEffect, useState } from 'react';
import { Center, Stack, Group } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import classes from './CollapsedSideBar.module.css';
import navigationConfig from '@/configs/navigation.config';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Views from '@/components/Layout/Views';
import useAuth from '@/utils/hooks/useAuth';
import CollapsedSideBarUserPopOver from '@/components/UserPopOver/CollapsedSideBarUserPopOver';
import AuthorityCheck from '@/route/AuthorityCheck';
import { useAppSelector } from '@/store';
import { useDispatch } from 'react-redux';
import { setLayout } from '@/store/slices/theme/themeSlice';
import { LayoutTypes } from '@/@types/layout';
import { Switch } from '@mantine/core';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';



function CollapsedSideBarBottomContent({
  isExpanded,
  keycloak,
  username,
}: {
  isExpanded: any;
  keycloak: any;
  username: string;
}) {
  const handleLogout = () => {
    if (keycloak && typeof keycloak.logout === 'function') {
      keycloak.logout(); // Ensure keycloak has the logout function
    } else {
      console.error('Keycloak or logout method is not available.');
    }
  };
  return (
    <div className={classes.linkWrapper} >
      <div className={'admin-welcome'}>
        {/* Optional: Add text for the link if expanded */}
        {isExpanded && <span className={classes.linkText}>{username}</span>}
      </div>
      <div className={classes.link} onClick={handleLogout}>
        <IconLogout style={{ color: '#d63939' }} />
        {/* Optional: Add text for the link if expanded */}
        {isExpanded && (
          <span className={classes.linkText} style={{ color: '#d63939' }}>
            Exit
          </span>
        )}
      </div>
    </div>
  );
}

function CollapsedSideBarContent({keycloak, username}: {keycloak:any; username: string}) {
  const [isExpanded, setIsExpanded] = useState(false); // State to track expansion
  const [checked, setChecked] = useState(false);
  const [active, setActive] = useState('');
  const [wasManuallyCollapsed, setWasManuallyCollapsed] = useState(false); // Track manual collapse
  const navigate = useNavigate();
  const location = useLocation();
  const userAuthority = useAppSelector((state) => state.auth.user.role);
  const dispatch = useDispatch(); // Hook to dispatch Redux actions

  // Handle automatic collapsing when screen size is small
  // Function to toggle navbar expansion
  const toggleNavbar = () => {
    setIsExpanded((prev) => {
      const newState = !prev;
      setWasManuallyCollapsed(!newState); // If collapsing, set manual flag
      return newState;
    });
  };

  // Handle automatic collapsing and expanding based on window size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false); // Force collapse on small screens
      } else if (!wasManuallyCollapsed) {
        setIsExpanded(true); // Expand if screen is large and was not manually collapsed
      }
    };

    window.addEventListener('resize', handleResize);

    // Set initial state based on screen size
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [wasManuallyCollapsed]);

  useEffect(() => {
    const currentPath = location.pathname.split('/')[1];
    setActive(currentPath);
  }, [location.pathname]);

  const links = navigationConfig.map((item) => (
    <AuthorityCheck
      userAuthority={userAuthority ? userAuthority : []}
      authority={item.authority}
      key={item.title}
    >
      <Link
        className={classes.link}
        data-active={item.path.split('/')[1] === active ? 'true' : undefined}
        to={item.path}
        onClick={(event) => {
          event.preventDefault();
          setActive(item.path);
          navigate(item.path);
        }}
      >
        <item.icon className={classes.linkIcon} stroke={1} />
        {/* Optional: Add text for the link if expanded */}
        {isExpanded && <span className={classes.linkText}>{item.title}</span>}
      </Link>
    </AuthorityCheck>
  ));

  return (
    <nav className={`${classes.navbar} ${isExpanded ? classes.expanded : ''}`}>
      <Group
        className={classes.header}
        justify="space-between"
        style={{ borderBottom: '2px solid lightgray', paddingBottom: '15px' }}
      >
        {/* Button to toggle navbar expansion */}
        <button onClick={toggleNavbar} className={classes.toggleButton}>
          <i
            style={{ color: 'black', marginLeft: '5px' }}
            className={`fa-solid ${isExpanded ? 'fa-angle-left' : 'fa-angle-right'}`}
          ></i>
          {/* Conditionally show the text based on `isExpanded` */}
          {isExpanded && (
            <span
              style={{
                color: 'black',
                paddingLeft: '10px',
                fontWeight: '300',
                textWrap: 'nowrap',
                position: 'absolute',
              }}
            >
              Minimize Menu
            </span>
          )}
        </button>
      </Group>
      {isExpanded && (
        <span
          style={{
            paddingTop: '10px',
            fontWeight: 'bolder',
            color: 'gray',
            fontSize: '10px',
            marginBottom: '-10px',
          }}
        >
          Analytics
        </span>
      )}

      <div className={classes.navbarMain}>
        <Stack
          justify="center"
          gap={4}
          style={{ borderBottom: '2px solid lightgray', paddingBottom: '15px', paddingTop: '10px', marginBottom:'10px' }}
        >
          {links}
        </Stack>
        {isExpanded && (
          <span
            style={{
              marginTop: '50px',
              fontWeight: 'bolder',
              color: 'gray',
              fontSize: '10px',
              marginBottom: '-5px',
            }}
            className='section-title'
          >
            Settings
          </span>
        )}
        <Stack justify="center" gap={4} style={{ paddingBottom: '15px', paddingTop: '10px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {isExpanded && <label style={{textWrap:'nowrap'}}>Dark Mode</label>}
            <Switch
              checked={checked}
              onChange={(event) => setChecked(event.currentTarget.checked)}
            />
          </div>
        </Stack>
      </div>
        <div className={classes.navbarMain}>
          
        </div>
      <CollapsedSideBarBottomContent isExpanded={isExpanded} keycloak={keycloak} username={username} />
    </nav>
  );
}


export default function CollapsedSideBar({keycloak, username}: {keycloak:any; username:string}) {
  return (
    <div
      style={{
        display: 'flex',
        flex: '1 1 auto',
        backgroundColor: 'rgb(241,240,240)',  
      }}
    >
      <CollapsedSideBarContent keycloak={keycloak} username={username} />
      <div
        style={{
          padding: '1rem',
          backgroundColor: 'rgb(241,240,240)',
          flex: 1,
        }}
      >
        <Views />
      </div>
    </div>
  );
}
