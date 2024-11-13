export const GET_ALL_BOARDS = `
  query {
    getAllBoards {
      id
      name
      createdAt
      createdBy
      updatedAt
      updatedBy
      userId
    }
  }
`;
