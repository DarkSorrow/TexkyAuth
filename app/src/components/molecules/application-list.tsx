import { Box } from '@mui/system';
import { DataGrid, GridColDef, GridSelectionModel } from '@mui/x-data-grid';
import { PrimaryButton } from '../atoms/primary-button';
import { Application } from '../pages/app-profile';
import SendIcon from '@mui/icons-material/Send';
import { useCallback, useState } from 'react';
import { Axios } from 'axios';


type ApplicationListProps = {
    applications: Application[]
}

const client = new Axios({
  baseURL: 'http://localhost:8080'
})

export const ApplicationList = ({applications}: ApplicationListProps) => {
  const [selected, setSelected] = useState<GridSelectionModel>([]);
  
  const onTransfer = useCallback(() => {
    client.post('/api/flow/my/applications', {
      
    })
    console.log(selected)
    return true;
  }, [selected])

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
    <PrimaryButton text="Take over selected" startIcon={<SendIcon />} onClick={onTransfer} />

    </>
}