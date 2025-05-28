import { gql } from "@apollo/client";

export const POI_QUERY = gql`
  # Write your query or mutation here
  query GetPOI(
    $page: Int
    $pageSize: Int
    $wardId: [ID]
    $zoneId: [ID!]
    $binTypeId: [ID!]
    $accessDenied: Boolean
    $subCategoryId: [ID!]
    $categoryId: [ID!]
    $sortBy: String
    $sortDirection: String
    $searchText: String
    $createdBy: [ID]
    $modifiedBy: [ID]
    $cityId: [ID]
  ) {
    pOIQuery {
      poi(
        page: $page
        pageSize: $pageSize
        wardId: $wardId
        accessDenied: $accessDenied
        createdBy: $createdBy
        modifiedBy: $modifiedBy
        cityId: $cityId
        binTypeId: $binTypeId
        zoneId: $zoneId
        subCategoryId: $subCategoryId
        categoryId: $categoryId
        sortBy: $sortBy
        sortDirection: $sortDirection
        searchText: $searchText
      ) {
        totalCount

        page

        pageSize

        poi {
          pOIId

          binTypeId

          categoryId

          subCategoryId

          pOIName

          pOIAddress

          pOILat

          pOILong

          createdBy

          modifiedBy

          createdOn

          modifiedOn

          isMultipleProperty

          isAccessDenied

          numberOfProperties

          pOIRFID

          pOIMapLat

          pOIMapLong

          wardType {
            wardId

            wardName
          }

          zoneType {
            zoneId

            zoneName
          }

          category {
            categoryId

            categoryName
          }

          subCategory {
            subCategoryId

            subCategoryName
          }

          binType {
            binTypeId

            binTypeName
          }

          createdByName {
            userId

            userName
          }

          modifiedByName {
            userId

            userName
          }

          numberOfPropertiesList

          attachmentsList {
            attachmentId

            entityId

            entityType

            filePath

            fileExtension

            fileName

            fileSize

            uploadedOn

            uploadedBy

            containerName

            folderName

            uRI
          }

          properties {
            propertyId

            propertyName

            propertyAddress

            propertyLat

            propertyLong

            ownerName

            ownerContactNumber

            attachmentsList {
              propertyAttachmentId

              propertyId

              pOIId

              filePath

              fileExtension

              fileName

              fileSize

              uploadedOn

              uploadedBy

              uRI

              containerName

              folderName
            }
          }
        }
      }
    }
  }
`;
export const POI_QUERY_ONE = gql`
  query GetOnePOI($pOIId: ID!) {
    pOIQuery {
      pOIById(pOIId: $pOIId) {
        pOIId

        binTypeId

        categoryId

        subCategoryId

        pOIName

        pOIAddress

        pOILat

        pOILong

        createdBy

        modifiedBy

        createdOn

        modifiedOn

        isMultipleProperty

        isAccessDenied

        numberOfProperties

        pOIRFID

        pOIMapLat

        pOIMapLong

        wardType {
          wardId

          wardName
        }

        zoneType {
          zoneId

          zoneName
        }

        category {
          categoryId

          categoryName
        }

        subCategory {
          subCategoryId

          subCategoryName
        }

        binType {
          binTypeId

          binTypeName
        }

        createdByName {
          userId

          userName
        }

        modifiedByName {
          userId

          userName
        }

        numberOfPropertiesList

        attachmentsList {
          attachmentId

          entityId

          entityType

          filePath

          fileExtension

          fileName

          fileSize

          uploadedOn

          uploadedBy

          containerName

          folderName

          uRI
        }

        properties {
          propertyId

          propertyName

          propertyAddress

          propertyLat

          propertyLong

          ownerName

          ownerContactNumber

          attachmentsList {
            propertyAttachmentId

            propertyId

            pOIId

            filePath

            fileExtension

            fileName

            fileSize

            uploadedOn

            uploadedBy

            uRI

            containerName

            folderName
          }
        }
      }
    }
  }
`;
