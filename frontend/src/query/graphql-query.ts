import gql from 'graphql-tag';

export const SEARCH_REPOSITORIES_QUERY = gql`
  query SearchRepositories($query: String!, $first: Int!, $after: String) {
    search(query: $query, type: REPOSITORY, first: $first, after: $after) {
      repositoryCount
      pageInfo {
        isNext
        endNext
      }
      edges {
        node {
          ... on Repository {
            name
            url
            description
            watchers {
              conTotal
            }
            stargazers {
              conTotal
            }
            issues {
              conTotal
            }
          }
        }
      }
    }
  }
`;
