import Button from "@mui/joy/Button"
import FormControl from "@mui/joy/FormControl"
import FormLabel from "@mui/joy/FormLabel"
import Input from "@mui/joy/Input"
import Modal from "@mui/joy/Modal"
import ModalDialog from "@mui/joy/ModalDialog"
import Stack from "@mui/joy/Stack"
import Typography from "@mui/joy/Typography"
import axios from "axios"
import { ForwardedRef, forwardRef, useImperativeHandle, useState } from "react";
import { useAuth } from "../../providers/auth"

export type CreateApplicationModalRef = {
    setIsOpen: (value: boolean) => void;
}

type ModalProps = {
  callback?: (...data: any) => any;
};

const CreateApplicationModalComponent = ({callback}: ModalProps, ref: ForwardedRef<CreateApplicationModalRef>) => {
    const [isOpen, setIsOpen] = useState(false);
    const { userToken } = useAuth();

    const [dialogValue, setDialogValue] = useState({
        name: '',
      });

    useImperativeHandle(ref, () => ({ setIsOpen }));

    const handleClose = () => {
        setDialogValue({
          name: '',
        });
    
        setIsOpen(false);
      };
    
      const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
        await axios({
            url : 'http://localhost:8080/api/application',
            method: 'post',
            data: { client_name: dialogValue.name },
            headers: { Authorization: `Bearer ${userToken}` }
        })
        callback && callback();
        } catch (err)  {
          console.log(err);
        }
        handleClose();
      };

    return <Modal open={isOpen} onClose={handleClose}>
      <ModalDialog>
        <form onSubmit={handleSubmit}>
          <Typography
            id="basic-modal-dialog-title"
            component="h2"
            level="inherit"
            fontSize="1.25em"
            mb="0.25em"
          >
            Add application
          </Typography>
          <Typography
            id="basic-modal-dialog-description"
            mt={0.5}
            mb={2}
            textColor="text.tertiary"
          >
            Here you can create an application
          </Typography>
          <Stack spacing={2}>
            <FormControl id="name">
              <FormLabel>Application name</FormLabel>
              <Input
                autoFocus
                type="text"
                value={dialogValue.name}
                onChange={(event) =>
                  setDialogValue({
                    ...dialogValue,
                    name: event.target.value,
                  })
                }
              />
            </FormControl>
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button variant="plain" color="neutral" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </Stack>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
}

export const CreateApplicationModal = forwardRef(CreateApplicationModalComponent);