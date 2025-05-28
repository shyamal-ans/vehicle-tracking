import { gql } from "@apollo/client";

export const VERTICAL_QUERY = gql`
query GetAllVertical(
  $searchText: String
  $sortBy: String
  $sortDirection: String
  $page: Int
  $pageSize: Int
) {
  verticalQuery {
    getAllVerticals(
      searchText: $searchText
      sortBy: $sortBy
      sortDirection: $sortDirection
      page: $page
      pageSize: $pageSize
    ) {
      verticalId
      verticalName
      description
      createdOn
      modifiedOn
    }
  }
}
`