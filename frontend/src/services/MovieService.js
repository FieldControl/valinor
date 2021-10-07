import http from "../http_common.js";

const findByTitle = (title) => {
  return http.get(`/api/v1/movie/${title}`);
};
const useID = (id) => {
  console.log(id);
  return http.get(`/api/v1/movie/id/${id}`);
};
// eslint-disable-next-line import/no-anonymous-default-export
export default { findByTitle, useID };
