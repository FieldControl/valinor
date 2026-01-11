import { gql } from 'apollo-angular';

export const GET_BOARDS = gql`
  query GetBoards {
    boards {
      id
      title
    }
  }
`;

export const GET_BOARDS_FULL_INFO = gql`
  query GetBoardsFullInfo {
    boards {
      id
      title
      columns {
        id
        title
        cards {
          id
          title
          desc
        }
      }
    }
  }
`;

export const GET_BOARD_BY_ID = gql`
  query GetBoardById($id: Int!) {
    board(id: $id) { 
      id
      title
      columns {
        id
        title
        cards {
          id
          title
          desc
        }
      }
    }
  }
`;