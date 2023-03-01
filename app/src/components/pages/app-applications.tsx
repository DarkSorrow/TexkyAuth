import { useState, useEffect, MouseEvent } from 'react';
import { useTranslation, Trans } from "react-i18next";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import {
  GridActionsCellItem,
  GridRowParams,
  GridEnrichedColDef,
  GridColumnHeaderParams,
} from "@mui/x-data-grid";
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';

import { AppApplicationsTemplate } from "../templates/app-applications";
import { AppDataGrid } from '../molecules/app-datagrid';
import { AppDialogConfirm } from '../organisms/app-dialog-confirm';
import { Openi18nOption } from '../../types/Schemas';
import { useAuth } from '../../providers/auth';
import { LoadingSuspense } from '../atoms/loading-suspense';
import { DataLoad, Application } from '../../types/App';
import { BASE_API } from '../../utils/constants';
import { deleteRecord } from '../../utils/request';

export const AppApplicationsPage = () => {
  const { t } = useTranslation();
  const { userToken, exp } = useAuth();
  const navigate = useNavigate();
  const [reload, setReload] = useState(false);
  const [data, setData] = useState<DataLoad<Application>>({
    loading: true,
    data: [],
  });
  const [cfDel, setCfDel] = useState<Openi18nOption>({
    open: false,
    i18nMessage: '',
  });
  const openClient = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.currentTarget.dataset && event.currentTarget.dataset['id']) {
      navigate(`/edit/application/${event.currentTarget.dataset['id']}`)
    }
  }

  //navigator.clipboard.writeText('Copy this text to clipboard')
  useEffect(() => {
    const init = async () => {
      try {
        const response = await fetch(`${BASE_API}/applications`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        });
        const resp = await response.json();
        if (response.status === 200) {
          setData({
            loading: false,
            data: resp.data.map((data: Application) => ({
              ...data,
              id: data.client_id,
            })),
          });
        } else {
          setData({
            loading: false,
            data: [],
          });
        }
      } catch (err)  {
        console.log(err);
        setData({
          loading: false,
          data: [],
        });
      }  
    }
    init();
  }, [userToken, reload]);

  const handleClose = () => {
    setCfDel({
      ...cfDel,
      open: false,
    });
  }
  const handleDelete = async () => {
    if (userToken && exp && cfDel.i18nObject?.id) {
      try {
        await deleteRecord(`${BASE_API}/application/${cfDel.i18nObject?.id}`, userToken);
        setData({
          loading: true,
          data: [],
        })
      } catch (err) {
        console.log(err)
      }
    }
    setCfDel({
      ...cfDel,
      open: false,
    });
  }
  const renderRowActions = (params: GridRowParams) => [
    <GridActionsCellItem
      icon={<DeleteIcon color="error" />}
      onClick={() => {
        setCfDel({
          open: true,
          i18nMessage: 'cfDel',
          i18nObject: {
            name: params.row.client_name,
            id: params.id,
          }
        });
      }}
      data-id={params.id}
      label="delete-row"
    />,
    <GridActionsCellItem
      icon={<EditIcon color="primary" />}
      onClick={openClient}
      data-id={params.id}
      data-name={params.row.client_name}
      label="edit-row"
    />,
  ];

  const columnsDef: GridEnrichedColDef[] = [
    {
      field: "logo_uri",
      headerName: t<string>("pApplication.logo"),
      description: t<string>("pApplication.logo"),
      editable: false,
      flex: 1,
    },
    {
      field: "client_name",
      headerName: t<string>("pApplication.name"),
      description: t<string>("pApplication.name"),
      editable: false,
      flex: 1,
    },
    {
      field: "client_id",
      headerName: t<string>("pApplication.id"),
      description: t<string>("pApplication.id"),
      editable: false,
      flex: 1,
    },
    {
      field: "application_type",
      headerName: t<string>("pApplication.type"),
      description: t<string>("pApplication.type"),
      editable: false,
      flex: 1,
    },
    {
      field: "suspended",
      headerName: t<string>("pApplication.active"),
      description: t<string>("pApplication.active"),
      editable: false,
      flex: 1,
    },
    {
      field: "updatedAt",
      headerName: t<string>("pApplication.update"),
      description: t<string>("pApplication.update"),
      editable: false,
      flex: 1,
    },
    {
      field: "actions",
      renderHeader: (params: GridColumnHeaderParams) => <div></div>,
      type: "actions",
      getActions: renderRowActions,
      flex: 0.8,
    },
  ];

  if (data.loading) {
    <LoadingSuspense />
  }
  return (
    <AppApplicationsTemplate
      applicationTitle={
      <Card
        variant="outlined"
        orientation="horizontal"
        sx={{
          width: '100%',
          gap: 2,
        }}
      >
        <div>
          <Typography level="h2" fontSize="lg" id="card-description" mb={0.5}>
            {t<string>('pApplication.title')}
          </Typography>
          <Typography fontSize="sm" aria-describedby="card-description" mb={1} sx={{ color: 'text.tertiary' }}>
            {t<string>('pApplication.desc')}
          </Typography>
        </div>
      </Card>}
      applicationList={
      <>
        <AppDataGrid
          id="applications-grid" 
          createTitle={t<string>('pApplication.addApp')}
          noData={t<string>('noData')}
          onClickCreate={openClient}
          columns={columnsDef}
          disableCreate={true}
          rows={data.data}
          checkboxSelection
        />  
        <AppDialogConfirm
          id="applications"
          title={t<string>('remove')}
          open={cfDel.open}
          onClose={handleClose}
          onConfirm={handleDelete}
        >
          <Trans i18nKey={cfDel.i18nMessage} values={cfDel.i18nObject} />
        </AppDialogConfirm>
      </>
        }
    />
  );
}
