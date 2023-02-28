import { Button } from '@mui/material';
import { useRef } from 'react';
import { CreateApplicationModal, CreateApplicationModalRef } from '../molecules/create-application-modal';

export const AppSchemasPage = () => {
  const createModalRef = useRef<CreateApplicationModalRef>(null);


  const openModal = () => {
    createModalRef.current?.setIsOpen(true);
  }

  return (
    <>
      <Button onClick={openModal} variant='contained'>
        Create Application
      </Button>
      <CreateApplicationModal ref={createModalRef} />
    </>
  );
}
