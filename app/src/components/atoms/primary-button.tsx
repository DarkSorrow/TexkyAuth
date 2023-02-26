import { Button } from '@mui/material';

type PrimaryButtonProps = {
    text: string;
    onClick: () => boolean;
    startIcon?: JSX.Element;
}

export const PrimaryButton = ({ text, onClick, startIcon }: PrimaryButtonProps) => {
    return <Button onClick={onClick} variant="contained" color='primary' startIcon={startIcon}>
        {text}
  </Button>
}