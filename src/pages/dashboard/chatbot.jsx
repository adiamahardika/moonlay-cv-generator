import 'react-chatbot-kit/build/main.css';
import Grid from '@mui/material/Grid';
//@ts-ignore
import Moonlayai from '../../components/chatbot/chatbot';

export default function applicantdata() {
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid item xs={12} sx={{ mb: -2.25 }}>
      <Moonlayai />
      </Grid>
    </Grid>
  );
}
