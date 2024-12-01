
import Grid from '@mui/material/Grid';

// project import
import MoonlayQuotation from './MoonlayQuotation';

// assets


// avatar style

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid item xs={12} sx={{ mb: -2.25 }}>
      <MoonlayQuotation/>
      </Grid>
    </Grid>
  );
}
