import { useFormContext, Controller, get } from 'react-hook-form';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import Select from '@mui/joy/Select';
import { useTranslation } from "react-i18next";

type AtomsProps = {
  name: string;
  label: string;
  defaultValue?: string;
  children?: React.ReactNode;
};

export const ControlSelect = ({ name, label, defaultValue, children }: AtomsProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { t } = useTranslation();
  const error = get(errors, name);
  const isError = error !== undefined;
  console.log(errors);
  return (
    <FormControl>
      <FormLabel>
        {label}
      </FormLabel>
      <Controller
        control={control}
        name={name}
        defaultValue={defaultValue}
        render={({ field }) => (
          <Select name={field.name} defaultValue={defaultValue} value={field.value} onChange={(event, val) => {
            field.onChange(val);
          }}>
            {children}
          </Select>
        )}
      />
      <FormHelperText>{isError ? t<string>([`error.${error.message}`, error.message]) : ''}</FormHelperText>
    </FormControl>
  );
}
//helperText={isError ? t<string>([`error.front.${error.message}`, error.message]) : ''}
