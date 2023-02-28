import { Button } from '@mui/material';

type PrimaryButtonProps = {
    text: string;
    onClick: () => any;
    startIcon?: JSX.Element;
    disabled?: boolean;
}

export const PrimaryButton = ({ text, onClick, startIcon, disabled }: PrimaryButtonProps) => {
    return <Button disabled={disabled} onClick={onClick} variant="contained" color='primary' startIcon={startIcon}>
        {text}
  </Button>
}