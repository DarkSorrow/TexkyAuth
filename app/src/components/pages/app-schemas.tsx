import Box from '@mui/joy/Box';
import { Button } from '@mui/material';
import { DataGrid, GridColDef, GridSelectionModel } from '@mui/x-data-grid';
import { useEffect, useRef, useState } from 'react';
import { CreateApplicationModal, CreateApplicationModalRef } from '../molecules/create-application-modal';
import axios from 'axios';
import { useAuth } from '../../providers/auth';
import { DeleteButton } from '../atoms/delete-button';

type ApplicationsData = {
  data: Application[]
}

export const AppSchemasPage = () => {
  const createModalRef = useRef<CreateApplicationModalRef>(null);
  const [applications, setApplications] = useState<(Application & { id: string })[]>([])
  const [selected, setSelected] = useState<GridSelectionModel>([]);
  const { userToken } = useAuth();

  const fetchApplications = async () => {
    const { data: { data: applicationData } } = await axios<ApplicationsData>({
      url: 'http://localhost:8080/api/applications',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`
      }
  })
  setApplications(applicationData.map(el => ({ id: el.client_id, ...el })));
}

const deleteApplications = async () => {
  const promises: Promise<any>[] = []
  selected.forEach((clientId: any) => {
    promises.push(axios({
        url: `http://localhost:8080/api/application/${clientId}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      })
    )
  })
  
  try {
    await Promise.all(promises);
    return true;
  } catch (e) {
    return false;
  }

}

  useEffect(() => {
    fetchApplications()
  }, []);
  
  const columns: GridColDef[] = [
    {field: 'id', headerName: 'id', width: 300},
    {field: 'application_type', headerName: 'application_type'},
    {field: 'client_application_type', headerName: 'client_application_type'},
    {field: 'client_name', headerName: 'client_name'},
    {field: 'client_secret', headerName: 'client_secret'},
    {field: 'client_uri', headerName: 'client_uri'},
    {field: 'consent_flow', headerName: 'consent_flow'},
    {field: 'contacts', headerName: 'contacts'},
    {field: 'cors_allowed', headerName: 'cors_allowed'},
    {field: 'default_acr', headerName: 'default_acr'},
    {field: 'flow_account_creation', headerName: 'flow_account_creation'},
    {field: 'flow_contracts', headerName: 'flow_contracts'},
    {field: 'flow_custody', headerName: 'flow_custody'},
    {field: 'grant_types', headerName: 'grant_types'},
    {field: 'legal_id', headerName: 'legal_id'},
    {field: 'logo_uri', headerName: 'logo_uri'},
    {field: 'notif_params_json', headerName: 'notif_params_json'},
    {field: 'policy_uri', headerName: 'policy_uri'},
    {field: 'post_logout_redirect_uris', headerName: 'post_logout_redirect_uris'},
    {field: 'redirect_uris', headerName: 'redirect_uris'},
    {field: 'response_types', headerName: 'response_types'},
    {field: 'sector_identifier_uri', headerName: 'sector_identifier_uri'},
    {field: 'subject_type', headerName: 'subject_type'},
    {field: 'suspended', headerName: 'suspended'},
    {field: 'tos_uri', headerName: 'tos_uri'},
    {field: 'updated_at', headerName: 'updated_at'},
  ];

  const openModal = () => {
    createModalRef.current?.setIsOpen(true);
  }

  return (
    <>
      <Button onClick={openModal} variant='contained'>
        Create Application
      </Button>
      <>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
          rows={applications}
          onSelectionModelChange={(newSelectionModel) => setSelected(newSelectionModel)}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
          disableSelectionOnClick
          experimentalFeatures={{ newEditingApi: true }}
        />
      </Box>
      <CreateApplicationModal ref={createModalRef} />
      <DeleteButton text='Delete selected applications' onDelete={deleteApplications} />
    </>
    </>
  );
}
