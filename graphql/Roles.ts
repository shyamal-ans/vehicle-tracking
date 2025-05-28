import { gql } from "@apollo/client";

export const GET_ALL_ROLES = gql`
query GetAllRoles(
  $roleName: String
  $status: String
  $createdBy: ID
  $modifiedBy: ID
  $sortBy: String
  $page: Int
  $pageSize: Int
  $sortDirection: String
) {
  roleQuery {
    roles(
      roleName: $roleName
      status: $status
      createdBy: $createdBy
      modifiedBy: $modifiedBy
      sortBy: $sortBy
      page: $page
      pageSize: $pageSize
      sortDirection: $sortDirection
    ) {
      roleId
      roleName
      description
      status
    }
  }
}

`