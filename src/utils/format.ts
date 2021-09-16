export const abbreviateNumber = (value: number): string => {
  if (isNaN(value)) return "";

  if (value === 0) return "0";

  let newValue: number = value;
  let suffixNum: number = 0;

  const suffixes = ["", "K", "M", "B", "T"];

  while (newValue >= 1000) {
    newValue /= 1000;
    suffixNum++;
  }

  const suffix = suffixes[suffixNum];

  return `${newValue.toPrecision(3)}${suffix}`;
};
