
export enum ViewFeatureEnum {
  GRID_VIEW = 'gridView',
  LIST_VIEW = 'listView',
  PREVIEW = 'preview',
  ZOOM_IN = 'zoomIn',
  DOWNLOAD = 'download',
  PHONE = 'phone',
  EMAIL = 'email',
  PROFILE_IMAGE = 'profileImage',
  ORGANIZATION = 'organization',
  ROLE = 'role',
  FIRST_NAME = 'firstName',
  LAST_NAME = 'lastName',
  USERNAME = 'username',
  DOCUMENT_UPDATE_DATE = 'documentUpdateDate',
  DOCUMENT_UPLOAD_BY = 'documentUploadBy',
  DOCUMENT_OTHER_CONTACTS_SHARED_WITH = 'documentOtherContactsSharedWith',
  DOCUMENT_VALID_UNTIL = 'documentValidUntil',
}

export default interface ViewFeature {
  _id: string;
  featureName: string;
  featureDisplay: string;
}
