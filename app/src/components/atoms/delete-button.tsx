import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from '@mui/material';

type DeleteButtonProps = {
    text: string;
    onDelete: () => Promise<boolean>;
}

export const DeleteButton = ({ text, onDelete }: DeleteButtonProps) => {
    return <Button onClick={onDelete} variant="outlined" color='error' startIcon={<DeleteIcon />}>
        {text}
  </Button>
}