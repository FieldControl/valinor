import { gql } from 'apollo-angular';

export const GET_CARD_BY_ID = gql`
    query GetCardById($id: Int!) {
        cards (id: $id) {
            id
            title
            desc
        }
    }
`;