export const GET_ALL_CARDS = `
  query {
    getAllCards {
      id
      title
      description
      position
      createdAt
      createdBy
      updatedAt
      updatedBy
      columnId
      column {
        id
        name
        position
        createdAt
        createdBy
        updatedAt
        updatedBy
        boardId
      }
    }
  }
`;
