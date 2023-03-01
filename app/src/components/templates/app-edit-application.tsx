import Grid from '@mui/joy/Grid';
interface TemplateProps {
  title: React.ReactNode,
  clientInfo: React.ReactNode,
  URLParams: React.ReactNode,
  privacyDisplay: React.ReactNode,
  flowParams: React.ReactNode,
  submit: React.ReactNode,
}

export const AppEditApplicationTemplate = ({ title, clientInfo, URLParams, privacyDisplay, flowParams, submit } : TemplateProps) => {
  return (
    <Grid container spacing={2} sx={{ flexGrow: 1 }}>
      <Grid xs={12}>
        {title}
      </Grid>
      <Grid xs={12}>
        {clientInfo}
      </Grid>
      <Grid xs={12} md={6}>
        {flowParams}
      </Grid>
      <Grid xs={12} md={6}>
        {URLParams}
      </Grid>
      <Grid xs={12}>
        {privacyDisplay}
      </Grid>
      <Grid xs={12} sx={{ textAlign: 'center', pb: 10 }}>
        {submit}
      </Grid>
    </Grid>
  );
}
