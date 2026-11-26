// Top navigation bar: three tabs for the tools (Track color, Metadata, Jobs) on the
// left and Help, Settings and Sign in on the right. The current tab is highlighted
// from the URL, so the bar needs no state of its own.
import { AppBar, Box, Button, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

/** Tabs for the tools. `match` says which URLs keep the tab highlighted. */
const TOOL_TABS = [
  { label: 'Track color', to: '/videos', match: /^\/(videos|preview)(\/|$)/ },
  { label: 'Metadata', to: '/metadata', match: /^\/metadata(\/|$)/ },
  { label: 'Jobs', to: '/jobs', match: /^\/jobs(\/|$)/ },
];

/** Links on the right-hand side of the bar. */
const UTILITY_LINKS = [
  { label: 'Help', to: '/help' },
  { label: 'Settings', to: '/settings' },
  { label: 'Sign in', to: '/sign-in' },
];

/**
 * Finds which tool tab matches the current URL.
 *
 * @param {string} pathname - the current location's pathname
 * @returns {string | false} the tab's `to` value, or false (no tab highlighted) on Help, Settings and Sign in
 */
function getActiveTab(pathname) {
  const active = TOOL_TABS.find(function matchesPath(tab) {
    return tab.match.test(pathname);
  });
  return active ? active.to : false;
}

/**
 * The app's navigation bar, shown above every page.
 *
 * @returns {JSX.Element}
 */
export function AppNav() {
  const { pathname } = useLocation();

  return (
    <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6" component="span" color="primary">
          Centroid Finder
        </Typography>
        <Tabs value={getActiveTab(pathname)} aria-label="Tools" sx={{ flexGrow: 1 }}>
          {TOOL_TABS.map(function renderTab(tab) {
            return <Tab key={tab.to} label={tab.label} value={tab.to} component={Link} to={tab.to} />;
          })}
        </Tabs>
        <Box component="nav" aria-label="Help and account" sx={{ display: 'flex', gap: 0.5 }}>
          {UTILITY_LINKS.map(function renderLink(link) {
            return (
              <Button
                key={link.to}
                component={Link}
                to={link.to}
                color="inherit"
                aria-current={pathname === link.to ? 'page' : undefined}
                sx={{ fontWeight: pathname === link.to ? 700 : 500 }}
              >
                {link.label}
              </Button>
            );
          })}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
