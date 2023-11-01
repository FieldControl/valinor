const formatDate = (strDate: string) => {
  const date = new Date(strDate);

  return `${date.getDate()}/${
    date.getMonth() + 1
  }/${date.getFullYear()} ${formatHoursAndMinutes(
    date.getHours()
  )}:${formatHoursAndMinutes(date.getMinutes())}`;
};

const formatHoursAndMinutes = (num: number) => {
  if (num.toString().length == 1) {
    return "0" + num;
  } else {
    return num;
  }
};

export { formatDate };
