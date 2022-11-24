export const handleOrder = (type: string) => {
  switch (type) {
    case "characters":
    case "events":
      return "name";
      break;
    case "creators":
      return "firstName";
      break;
    case "stories":
      return "id";
      break;
    default:
      return "title";
      break;
  }
};
