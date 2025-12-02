import { gql } from 'apollo-angular';

export const CREATE_BOARD = gql`
  mutation CreateBoard($createBoardInput: CreateBoardInput!) {
    createBoard(createBoardInput: $createBoardInput) {
      id
      title
    }
  }
`;

export const UPDATE_BOARD = gql`
  mutation UpdateBoard($updateBoardInput: UpdateBoardInput!) {
    updateBoard(updateBoardInput: $updateBoardInput) { 
      id 
      title
    }
  }
`;

export const REMOVE_BOARD = gql`
  mutation RemoveBoard($id: Int!) {
    removeBoard(id: $id) { 
      id 
      isArchived
    }
  }
`;