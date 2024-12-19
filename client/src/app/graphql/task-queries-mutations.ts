import { gql } from "apollo-angular";

export const CREATE_TASK = gql`
mutation createTask($name: String!, $description: String!, $status: String!) {
  createTask(createTaskInput: { name: $name, description: $description, status: $status }) {
    id
    name
    description
    status
  }
}
`;

export const GET_ALL_TASKS = gql`
  query getAllTasks {
    getAllTasks {
      id
      name
      description
      status
    }
  }
`;

export const GET_TASKS_BY_STATUS = gql`
query getTasksByStatus($status: String!) {
  getTasksByStatus(status: $status) {
    id
    name
    description
    status
  }
}
`;

export const DELETE_TASK = gql`
  mutation deleteTask($id: String!) {
    deleteTask(id: $id)
  }
`;

export const UPDATE_NAME = gql`
  mutation updateName($id: String!, $newName: String!) {
    updateName(id: $id, newName: $newName)
  }
`;

export const UPDATE_STATUS = gql`
  mutation updateStatus($id: String!, $newStatus: String!) {
    updateStatus(id: $id, newStatus: $newStatus)
  }
`;

export const UPDATE_DESCRIPTION = gql`
  mutation updateDescription($id: String!, $newDescription: String!) {
    updateDescription(id: $id, newDescription: $newDescription)
  }
`;