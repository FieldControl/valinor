import format from "date-fns/format";
import enUS from "date-fns/locale/pt-BR";

export default function FormatDate(date: string) {
  const currentDate = format(
    new Date(date),
    "dd MMM yyyy" /*Seg, 8 Out (Formato do exemplo) */,
    {
      locale: enUS,
    }
  );

  return currentDate;
}
