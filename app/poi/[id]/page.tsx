"use client";

import { useQuery } from "@apollo/client";
import { POI_QUERY_ONE } from "@/graphql/queries/poi";
import { formatDateTime } from "@/Utils/Utils";
import { useParams } from "next/navigation";

export default function POIDetail() {
  const params = useParams();
  const poiId = params.id as string;

  const { data, loading, error } = useQuery(POI_QUERY_ONE, {
    variables: { pOIId: poiId },
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-600">
      Error: {error.message}
    </div>
  );

  const poi = data?.pOIQuery?.pOIById;

  if (!poi) return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-600">
      POI not found
    </div>
  );

  return (
    <div className="bg-white min-h-screen w-full">
      <div className="ml-[-10px] py-1">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-3 py-3 border-b border-gray-200 flex justify-between items-start flex-wrap gap-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{poi.pOIName}</h1>
              <p className="mt-1 text-sm text-gray-600">{poi.pOIAddress}</p>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button className="px-4 py-1.5 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors">
                Approve
              </button>
              <button className="px-4 py-1.5 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors">
                Deny
              </button>
              <button className="w-12 h-9 flex items-center justify-center rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                <span className="text-lg font-semibold leading-none -mt-0.5">⟨</span>
              </button>
              <button className="w-12 h-9 flex items-center justify-center rounded border-2 border-blue-500 text-blue-500 hover:bg-blue-50 transition-colors">
                <span className="text-lg font-semibold leading-none -mt-0.5">⟩</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-1">
            {/* Left Column - Details */}
            <div className="p-1 border-r border-gray-200 lg:col-span-4 bg-gray-50">
              <div className="space-y-1 h-[calc(100vh-180px)] overflow-y-auto pr-1">
                <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
                  <h2 className="text-base font-semibold text-gray-900 mb-2 pb-1.5 border-b border-gray-100">Basic Information</h2>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center p-1 hover:bg-gray-50 rounded-md transition-colors duration-150">
                      <span className="text-xs text-gray-600 font-medium">Coordinates</span>
                      <span className="text-xs text-gray-900 font-semibold">{poi.pOILat}, {poi.pOILong}</span>
                    </div>
                    <div className="flex justify-between items-center p-1 hover:bg-gray-50 rounded-md transition-colors duration-150">
                      <span className="text-xs text-gray-600 font-medium">RFID</span>
                      <span className="text-xs text-gray-900 font-semibold">{poi.pOIRFID || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center p-1 hover:bg-gray-50 rounded-md transition-colors duration-150">
                      <span className="text-xs text-gray-600 font-medium">Access Denied</span>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full transition-colors duration-150 ${poi.isAccessDenied ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                        {poi.isAccessDenied ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
                  <h2 className="text-base font-semibold text-gray-900 mb-2 pb-1.5 border-b border-gray-100">Location Details</h2>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center p-1 hover:bg-gray-50 rounded-md transition-colors duration-150">
                      <span className="text-xs text-gray-600 font-medium">Zone</span>
                      <span className="text-xs text-gray-900 font-semibold">{poi.zoneType?.zoneName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center p-1 hover:bg-gray-50 rounded-md transition-colors duration-150">
                      <span className="text-xs text-gray-600 font-medium">Ward</span>
                      <span className="text-xs text-gray-900 font-semibold">{poi.wardType?.wardName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center p-1 hover:bg-gray-50 rounded-md transition-colors duration-150">
                      <span className="text-xs text-gray-600 font-medium">Category</span>
                      <span className="text-xs text-gray-900 font-semibold">{poi.category?.categoryName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center p-1 hover:bg-gray-50 rounded-md transition-colors duration-150">
                      <span className="text-xs text-gray-600 font-medium">Sub Category</span>
                      <span className="text-xs text-gray-900 font-semibold">{poi.subCategory?.subCategoryName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center p-1 hover:bg-gray-50 rounded-md transition-colors duration-150">
                      <span className="text-xs text-gray-600 font-medium">Bin Type</span>
                      <span className="text-xs text-gray-900 font-semibold">{poi.binType?.binTypeName || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
                  <h2 className="text-base font-semibold text-gray-900 mb-2 pb-1.5 border-b border-gray-100">Properties</h2>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center p-1 hover:bg-gray-50 rounded-md transition-colors duration-150">
                      <span className="text-xs text-gray-600 font-medium">Number of Properties</span>
                      <span className="text-xs text-gray-900 font-semibold">{poi.numberOfProperties}</span>
                    </div>
                    {poi.properties && poi.properties.length > 0 && (
                      <div className="mt-2">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Property List</h3>
                        <div className="space-y-1.5">
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
                          {poi.properties.map((property: any, index: number) => (
                            <div key={`property-${property.propertyId}-${index}`} className="bg-gray-50 rounded-md p-2 hover:bg-gray-100 transition-colors duration-150">
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-600 font-medium">Name</span>
                                  <span className="text-xs text-gray-900 font-semibold">{property.propertyName}</span>
                                </div>
                                <div className="flex flex-col space-y-0.5">
                                  <span className="text-xs text-gray-600 font-medium">Address</span>
                                  <span className="text-xs text-gray-900 font-semibold break-words">{property.propertyAddress}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-600 font-medium">Owner</span>
                                  <span className="text-xs text-gray-900 font-semibold">{property.ownerName || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-600 font-medium">Contact</span>
                                  <span className="text-xs text-gray-900 font-semibold">{property.ownerContactNumber || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
                  <h2 className="text-base font-semibold text-gray-900 mb-2 pb-1.5 border-b border-gray-100">Audit Information</h2>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center p-1 hover:bg-gray-50 rounded-md transition-colors duration-150">
                      <span className="text-xs text-gray-600 font-medium">Created By</span>
                      <span className="text-xs text-gray-900 font-semibold">{poi.createdByName?.userName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center p-1 hover:bg-gray-50 rounded-md transition-colors duration-150">
                      <span className="text-xs text-gray-600 font-medium">Created On</span>
                      <span className="text-xs text-gray-900 font-semibold">{formatDateTime(poi.createdOn)}</span>
                    </div>
                    <div className="flex justify-between items-center p-1 hover:bg-gray-50 rounded-md transition-colors duration-150">
                      <span className="text-xs text-gray-600 font-medium">Modified By</span>
                      <span className="text-xs text-gray-900 font-semibold">{poi.modifiedByName?.userName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center p-1 hover:bg-gray-50 rounded-md transition-colors duration-150">
                      <span className="text-xs text-gray-600 font-medium">Modified On</span>
                      <span className="text-xs text-gray-900 font-semibold">{formatDateTime(poi.modifiedOn)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Images */}
            <div className="p-1 lg:col-span-8">
              {poi.attachmentsList && poi.attachmentsList.length > 0 ? (
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-gray-900 mb-1">Images</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
                    {poi.attachmentsList.map((attachment: any, index: number) => (
                      <div key={`attachment-${attachment.attachmentId}-${index}`} className="group relative">
                        <div className="relative w-full h-[200px] rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={attachment.uRI}
                            alt={attachment.fileName}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <a
                            href={attachment.uRI}
                            download={attachment.fileName}
                            className="bg-white text-gray-900 px-3 py-1.5 text-sm rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                          >
                            Download
                          </a>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                          <p className="truncate">{attachment.fileName}</p>
                          <p className="text-gray-500">{attachment.fileSize}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4 text-sm">No images available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
