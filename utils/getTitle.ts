import { ItemProps } from "../interfaces/ItemProps";

export const getTitle = (type: string, data: ItemProps["data"]) => {
  switch (type) {
    case "characters":
      return data[0].name;
      break;
    case "creators":
      return data[0].fullName;
      break;
    default:
      return data[0].title;
      break;
  }
};
