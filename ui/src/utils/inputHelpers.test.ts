import { jest, expect, it, describe, afterEach, beforeEach } from '@jest/globals';
import { handleNumericInput } from './inputHelpers';

describe('handleNumericInput', () => {
    let mockSetter: ReturnType<typeof jest.fn>; 

    beforeEach(() => {
        mockSetter = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call setter with 0 when input is an empty string', () => {
        handleNumericInput('', mockSetter);

        expect(mockSetter).toHaveBeenCalledTimes(1);
        expect(mockSetter).toHaveBeenCalledWith(0);
    });

    it('should call setter with the numeric value when input is a valid number string', () => {
        handleNumericInput('123', mockSetter);

        expect(mockSetter).toHaveBeenCalledTimes(1);
        expect(mockSetter).toHaveBeenCalledWith(123);
    });

    it('should not call setter when input is a non-numeric string', () => {
        handleNumericInput('abc', mockSetter);

        expect(mockSetter).not.toHaveBeenCalled();
    });

    it('should not call setter when input is a string with mixed characters', () => {
        handleNumericInput('12a3', mockSetter);

        expect(mockSetter).not.toHaveBeenCalled();
    });
});