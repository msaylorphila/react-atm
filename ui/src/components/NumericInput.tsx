import { TextField, TextFieldProps } from '@mui/material';
import { handleNumericInput } from '../utils/inputHelpers';

type NumericInputProps = Omit<TextFieldProps, 'type' | 'inputMode' | 'onChange'> & {
    value: number;
    onChange: (value: number) => void;
    allowNegative?: boolean;
};

export const NumericInput = ({
    value,
    onChange,
    allowNegative = false,
    ...props
}: NumericInputProps) => (
    <TextField
        {...props}
        type='number'
        inputMode='numeric'
        value={value === 0 ? '' : value}
        onChange={(e) => handleNumericInput(e.target.value, onChange)}
    />
);