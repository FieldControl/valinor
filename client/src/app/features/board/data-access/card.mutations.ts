import { gql } from 'apollo-angular';

export const CREATE_CARD = gql`
  mutation CreateCard($createCardInput: CreateCardInput!) {
    createCard(createCardInput: $createCardInput) {
      id
      title
      desc
    }
  }
`;

export const UPDATE_CARD = gql`
  mutation UpdateCard($updateCardInput: UpdateCardInput!) {
    updateCard(updateCardInput: $updateCardInput) { 
      id 
      title 
      desc
      columnId
    }
  }
`;

export const REMOVE_CARD = gql`
  mutation RemoveCard($id: Int!) {
    removeCard(id: $id) { 
      id 
      isArchived
    }
  }
`;