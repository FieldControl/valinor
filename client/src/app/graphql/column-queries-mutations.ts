import { gql } from "apollo-angular";

export const CREATE_COLUMN = gql`
  mutation createColumn($name: String!, $color: String!) {
    createColumn(createColumnInput: { name: $name, color: $color }) {
      id
      name
      color
    }
  }
`;

export const GET_ALL_COLUMNS = gql`
  query getAllColumns {
    getAllColumns {
      id
      name
      color
    }
  }
`;

export const DELETE_COLUMN = gql`
  mutation deleteColumn($id: String!) {
    deleteColumn(id: $id)
  }
`;