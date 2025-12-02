import { gql } from 'apollo-angular';

export const CREATE_COLUMN = gql`
  mutation CreateColumn($createColumnInput: CreateColumnInput!) {
    createColumn(createColumnInput: $createColumnInput) {
      id
      title
    }
  }
`;

export const UPDATE_COLUMN = gql`
  mutation UpdateColumn($updateColumnInput: UpdateColumnInput!) {
    updateColumn(updateColumnInput: $updateColumnInput) { 
      id 
      title
    }
  }
`;

export const REMOVE_COLUMN = gql`
  mutation RemoveColumn($id: Int!) {
    removeColumn(id: $id) { 
      id 
      isArchived 
    }
  }
`;