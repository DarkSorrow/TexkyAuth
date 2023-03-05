import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import Grid from '@mui/joy/Grid';
import { useTranslation } from "react-i18next";
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import Option from '@mui/joy/Option';

import { useAuth } from '../../providers/auth';
import { AppTitle } from "../molecules/app-title";
import { BASE_API } from "../../utils/constants";
import { ControlInput } from "../atoms/control-input";
import { ControlSelect } from "../atoms/control-select";
import { AppEditApplicationTemplate } from "../templates/app-edit-application";
import { Form } from "../atoms/forms";
import { LoadingSuspense } from "../atoms/loading-suspense";
import { IFormAppliation, ApplicationSchema } from "../../types/Zod";
import { SubmitLoading } from "../atoms/submit-loading";
import { EditDataLoad, Application } from '../../types/App';

const defaultApplication: Application = {
  client_id: '',
  application_type:          'web',
  client_application_type:   2,
  client_name:               '',
  client_secret:             '',
  client_uri:                '',
  consent_flow:              0,
  contacts:                  [],
  cors_origins:              [],
  default_acr:               [],
  flow_account_creation:     '',
  flow_contracts:            {},
  flow_custody:              0,
  grant_types:               ["refresh_token", "authorization_code"],
  legal_id:                  '',
  logo_uri:                  '',
  notif_params_json:         '',
  policy_uri:                '',
  post_logout_redirect_uris: [],
  redirect_uris:             [],
  response_types:            [],
  sector_identifier_uri:     '',
  subject_type:              '',
  suspended:                 false,
  tos_uri:                   '',
};



export const AppEditApplicationPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userToken, setOpenSnackbar } = useAuth();
  const { clientID } = useParams();
  const isEdit = clientID !== 'new';
  const [data, setData] = useState<EditDataLoad<Application>>({
    loading: true,
    data: {...defaultApplication}
  });
  const [error, setError] = useState('');
  const { reset } = useForm()
  // TODO make the version type differently
  // Allow version diff and only let use review old version
  // Modification made must create a new version in order not to break compatibility
  useEffect(() => {
    setData((prev) => ({
      ...prev,
      loading: true,
    }));
    const init = async () => {
      const response = await fetch(`${BASE_API}/application/${clientID}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });
      const resp = await response.json();
      if (response.status === 200) {
        setData({
          loading: false,
          data: resp.data,
        });
        console.log(resp.data)
        reset(resp.data)
      }
      setData((prev) => ({
        ...prev,
        loading: false,
      }));
    }
    if (isEdit) {
      init();
    } else {
      setData((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  }, [clientID, isEdit])
  
  const onSubmitHandler: SubmitHandler<IFormAppliation> = async (values: IFormAppliation) => {
    setError('');
    console.log('application', values);
    try {
      if (!isEdit) {
        values.client_id = undefined;
      }
      const response = await fetch(`${BASE_API}/application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify(values),
      });
      const resp = await response.json();
      if (response.status === 200) {
        navigate('/applications');
      } else {
        setError(`error.api.${resp.error}`);
      }
    } catch (err) {
      setError('error.api.Unknown');
    }
  }

  if (data.loading) {
    return <LoadingSuspense />;
  }
  return (
    <Form onSuccess={onSubmitHandler} resolver={zodResolver(ApplicationSchema)} defaultValues={data.data}>
      <AppEditApplicationTemplate 
        title={<AppTitle
          title={t<string>('eApplication.title')}
          subtitle={t<string>('eApplication.subtitle')}
        />}
        clientInfo={<Card sx={{ height: '100%' }}>
        <Typography level="h2" fontSize="lg" id="card-description" mb={0.5}>
          {t<string>('eApplication.tInfo')}
        </Typography>
        <Grid container spacing={1} sx={{ flexGrow: 1 }}>
          <Grid>
            <ControlInput
              required
              label={t<string>('eApplication.name')}
              name="client_name"
              data-testid="client_name"
              placeholder={t<string>('eApplication.name')}
            />
          </Grid>
          <Grid>
            <ControlSelect
              label={t<string>('eApplication.apptype')}
              name="application_type"
              data-testid="application_type"
            >
              <Option value="web">Web</Option>
              <Option value="native">Native</Option>
            </ControlSelect>
          </Grid>
        </Grid>
      </Card>}
        URLParams={
        <Card sx={{ height: '100%' }}>
          <Typography level="h2" fontSize="lg" id="card-description" mb={0.5}>
            {t<string>('eApplication.tUrlInfo')}
          </Typography>
          <div>url params</div>
        </Card>
        }
        flowParams={
          <Card sx={{ height: '100%' }}>
            <Typography level="h2" fontSize="lg" id="card-description" mb={0.5}>
              {t<string>('eApplication.tFlowInfo')}
            </Typography>
            <div>flow params</div>
          </Card>
        }
        privacyDisplay={
          <Card sx={{ height: '100%' }}>
            <Typography level="h2" fontSize="lg" id="card-description" mb={0.5}>
              {t<string>('eApplication.tTos')}
            </Typography>
            <div>fTos info</div>
          </Card>
        }
        submit={
          <SubmitLoading label={t<string>('create')} />
        }
      />
    </Form>
  );
}
