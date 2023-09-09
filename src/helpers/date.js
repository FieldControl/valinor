export const formatDateMonthAbbreviated = dateString => {
    const monthsAbbreviated = [
        "jan.", "feb.", "mar.", "apr.", "may", "jun.",
        "jul.", "aug.", "sep.", "oct.", "nov.", "dec."
    ];
    const date = new Date(dateString);
    const day = date.getDate();
    const month = monthsAbbreviated[date.getMonth()];
    const year = date.getFullYear();

    return `${day} de ${month} de ${year}`;
}

export const formatDateTimeDifference = dateString => {
    const date = new Date(dateString);
    const currentDate = new Date();
    const differenceInMilliseconds = currentDate - date;
    const differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));

    if (differenceInDays > 29) {
        return formatDateMonthAbbreviated(dateString);
    }

    if (differenceInDays > 0) {
        return `${differenceInDays} day${differenceInDays > 1 ? 's' : ''}`;
    }

    const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));

    if (differenceInMinutes > 60) {
        const differenceInHours = Math.floor(differenceInMinutes / 60);
        return `${differenceInHours} hour${differenceInHours > 1 ? 's' : ''}`;
    }

    return `${differenceInMinutes} minute${differenceInMinutes > 1 ? 's' : ''}`;
}