import Stack from '@mui/joy/Stack';

interface TemplateProps {
  applicationTitle: React.ReactNode,
  applicationList: React.ReactNode,
}

export const AppApplicationsTemplate = ({ applicationTitle, applicationList }: TemplateProps) => {
  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      {applicationTitle}
      {applicationList}
    </Stack>
  );
}
