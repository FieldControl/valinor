export const GET_ALL_COLUMNS = `
  query {
    getAllColumns {
    id
    name
    position
    createdAt
    createdBy
    updatedAt
    updatedBy
    boardId
    board {
      id
      name
      createdAt
      createdBy
      updatedAt
      updatedBy
      userId
    }
  }
}
`;
