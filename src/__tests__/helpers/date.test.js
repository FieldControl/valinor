import { formatDateMonthAbbreviated, formatDateTimeDifference } from '@/helpers/date'

describe('formatDateMonthAbbreviated', () => {
    test('date format month january', () => {
        const dateString = '2023-01-02T18:00:52Z';
        const formatted = formatDateMonthAbbreviated(dateString);

        expect(formatted).toBe('2 de jan. de 2023');
    });
    
    test('date format month december', () => {
        const dateString = '2023-12-12T18:00:52Z';
        const formatted = formatDateMonthAbbreviated(dateString);

        expect(formatted).toBe('12 de dec. de 2023');
    });
});

describe('formatDateTimeDifference', () => {
    test('date calculation minutes', () => {
        const testDate = new Date();
        testDate.setMinutes(testDate.getMinutes() - 10);
        const difference = formatDateTimeDifference(testDate.toISOString());

        expect(difference).toBe('10 minutes');
    });
    
    test('date calculation hours', () => {
        const testDate = new Date();
        testDate.setHours(testDate.getHours() - 3);
        const difference = formatDateTimeDifference(testDate.toISOString());

        expect(difference).toBe('3 hours');
    });
    
    test('date calculation days', () => {
        const testDate = new Date();
        testDate.setDate(testDate.getDate() - 5);
        const difference = formatDateTimeDifference(testDate.toISOString());
        
        expect(difference).toBe('5 days');
    });
    
    test('date calculation - format date for more than 29 days difference', () => {
        const testDate = new Date('2023-08-03T10:00:00Z');
        const difference = formatDateTimeDifference(testDate.toISOString());
        
        expect(difference).toBe('3 de aug. de 2023');
    });
});