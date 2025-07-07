import { gql } from '@apollo/client/core';

// Queries
export const GET_BOARDS = gql`
  query GetBoards {
    boards {
      id
      name
      columns {
        id
      }
    }
  }
`;

export const GET_BOARD = gql`
  query GetBoard($id: Int!) {
    board(id: $id) {
      id
      name
      columns {
        id
        title
        order
        cards {
          id
          title
          description
          order
        }
      }
    }
  }
`;

export const GET_COLUMNS = gql`
  query GetColumns {
    columns {
      id
      title
      order
      board {
        id
        name
      }
    }
  }
`;

export const GET_CARDS = gql`
  query GetCards {
    cards {
      id
      title
      description
      order
      column {
        id
        title
      }
    }
  }
`;

// Mutations
export const CREATE_BOARD = gql`
  mutation CreateBoard($name: String!) {
    createBoard(name: $name) {
      id
      name
    }
  }
`;

export const UPDATE_BOARD = gql`
  mutation UpdateBoard($id: Int!, $name: String!) {
    updateBoard(id: $id, name: $name) {
      id
      name
    }
  }
`;

export const DELETE_BOARD = gql`
  mutation DeleteBoard($id: Int!) {
    deleteBoard(id: $id)
  }
`;

export const CREATE_COLUMN = gql`
  mutation CreateColumn($boardId: Int!, $title: String!) {
    createColumn(boardId: $boardId, title: $title) {
      id
      title
      order
      board {
        id
        name
      }
    }
  }
`;

export const UPDATE_COLUMN = gql`
  mutation UpdateColumn($id: Int!, $title: String!) {
    updateColumn(id: $id, title: $title) {
      id
      title
      order
    }
  }
`;

export const DELETE_COLUMN = gql`
  mutation DeleteColumn($id: Int!) {
    deleteColumn(id: $id)
  }
`;

export const CREATE_CARD = gql`
  mutation CreateCard(
    $columnId: Int!
    $title: String!
    $description: String!
    $order: Int
  ) {
    createCard(
      columnId: $columnId
      title: $title
      description: $description
      order: $order
    ) {
      id
      title
      description
      order
      column {
        id
        title
      }
    }
  }
`;

export const UPDATE_CARD = gql`
  mutation UpdateCard(
    $id: Int!
    $title: String!
    $description: String!
    $columnId: Int!
  ) {
    updateCard(
      id: $id
      title: $title
      description: $description
      columnId: $columnId
    ) {
      id
      title
      description
      order
    }
  }
`;

export const DELETE_CARD = gql`
  mutation DeleteCard($id: Int!) {
    deleteCard(id: $id)
  }
`;

export const MOVE_CARD = gql`
  mutation MoveCard($id: Int!, $columnId: Int!) {
    moveCard(id: $id, columnId: $columnId) {
      id
      title
      description
      order
      column {
        id
        title
      }
    }
  }
`;

export const REORDER_CARD = gql`
  mutation ReorderCard($id: Int!, $newIndex: Int!) {
    reorderCard(id: $id, newIndex: $newIndex) {
      id
      title
      description
      order
    }
  }
`;
