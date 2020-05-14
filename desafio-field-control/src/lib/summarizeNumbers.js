export default number => {
  const textNumber = String(number);

  if (textNumber.length >= 4 && textNumber.length <= 6)
    return `${String(parseFloat(number / 1000).toFixed(1))}K`;

  if (textNumber.length > 6)
    return `${String(parseFloat(number / 1000000).toFixed(1))}M`;

  return number;
};
