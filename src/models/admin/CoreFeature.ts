import RoleType from './RoleType';

export enum CoreFeatureEnum {
  UPDATE_EXPIRATION_DATE = 'updateExpirationDate',
  SET_SHARE_TIME_LIMIT = 'setShareTimeLimit',
  UPLOAD_DOC_BEHALF_OWNER = 'uploadDocBehalfOwner',
  REPLACE_DOC_BEHALF_OWNER = 'replaceDocBehalfOwner',
  DELETE_DOC_BEHALF_OWNER = 'deleteDocBehalfOwner',
  UPADTE_OWNER_INFO = 'updateOwnerInfo',
  REQUEST_SHARED_DOC = 'requestSharedDoc',
  SHARE_DOC_WITH_OTHER = 'shareDocWithOther',
  REVOKE_SHARE_REQUEST = 'revokeShareRequest',
  SHARE_VIEW_OWNERS = 'shareViewOwners',
  SHARE_VIEW_FILE_EXIST = 'shareViewFileExist',
  NOTARIZE_DOCUMENTS = 'notarizeDocuments',
  TRANSFER_CLIENT_TO_HELPER = 'transferClientToHelper',
}

export default interface CoreFeature {
  _id: string;
  featureName: string;
  featureDisplay: string;
  featureRole: RoleType;
}
