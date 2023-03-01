import { Box } from '@mui/system';
import { DataGrid, GridColDef, GridSelectionModel } from '@mui/x-data-grid';
import { PrimaryButton } from '../atoms/primary-button';
import { Application } from '../pages/app-profile';
import SendIcon from '@mui/icons-material/Send';
import { useCallback, useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useAuth } from '../../providers/auth';
import * as fcl from "@onflow/fcl";
import { MOVE_CUSTODY_APPLICATIONS_URL } from '../../utils/constants';


type ApplicationListProps = {
    applications: Application[]
}

export const ApplicationList = ({applications}: ApplicationListProps) => {
  const [selected, setSelected] = useState<GridSelectionModel>([]);
  const { userToken } = useAuth();
  const [user, setUser] = useState<FlowUser>();

  useEffect(() => fcl.currentUser.subscribe(setUser), []); 
  
  const onTransfer = useCallback(async () => {
    const promises: Promise<AxiosResponse>[] = [];

    try {
      selected.forEach((appClientId) => {
        promises.push(axios({
          url : MOVE_CUSTODY_APPLICATIONS_URL,
          method: 'post',
          data: { destAddress: user?.addr, client_id: appClientId },
          headers: { Authorization: `Bearer ${userToken}` }
        }))
      })
  
      await Promise.all(promises);
  
      return true;
    } catch (e) {
      return false;
    }

  }, [selected, user?.addr, userToken])

    const columns: GridColDef[] = [
        { field: 'client_id', headerName: 'ClientID', width: 300 },
        {
          field: 'consent',
          headerName: 'Consent',
          width: 90,
        },
        {
          field: 'created_at',
          headerName: 'Date',
          width: 200,
          valueFormatter: (el) => new Date(el.value).toLocaleString(),
        },
        {
          field: 'detail_json.flow_custody',
          headerName: 'Custody',
          width: 150,
        },
        {
          field: 'updated_at',
          valueFormatter: (el) => new Date(el.value).toLocaleString(),
          headerName: 'Updated At',
          width: 200,
        },
      ];

    return <><Box sx={{ height: 400, width: '100%' }}>
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
    <PrimaryButton disabled={!user?.loggedIn || selected.length === 0} text="Take over selected" startIcon={<SendIcon />} onClick={onTransfer} />

    </>
}