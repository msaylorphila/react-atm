export const handleNumericInput = (
    value: string,
    setter: (num: number) => void
): void => {
    if (value === '' || /^\d+$/.test(value)) {
        setter(value === '' ? 0 : Number(value));
    }
};