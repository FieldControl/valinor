export const formatNumberToShortScale = number => {
    if(number < 1000) {
        return number.toString();
    }

    if(number < 1000000) {
        return (number / 1000).toFixed(1) + 'K';
    }

    return (number / 1000000).toFixed(1) + 'M';
}