import { formatNumberToShortScale } from '@/helpers/number'

describe('formatNumberToShortScale', () => {
    test('format number less than a thousand', () => {
        expect(formatNumberToShortScale(500)).toBe('500');
    });

    test('format number thousand', () => {
        expect(formatNumberToShortScale(1000)).toBe('1.0K');
    });
    
    test('format number thousand with decimal place', () => {
        expect(formatNumberToShortScale(1400)).toBe('1.4K');
    });

    test('format number million', () => {
        expect(formatNumberToShortScale(2000000)).toBe('2.0M');
    });

    test('format number million with decimal place', () => {
        expect(formatNumberToShortScale(2500000)).toBe('2.5M');
    });
});