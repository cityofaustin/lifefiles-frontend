interface DocumentType {
  _id?: string;
  name: string;
  fields?: DocumentField[];
  isTwoSided?: boolean;
  isRecordableDoc?: boolean;
  isProtectedDoc?: boolean;
  hasExpirationDate?: boolean;
  action?: string; // needed for the grid, might split this out
}

interface DocumentField {
  fieldName: string;
  required: boolean;
}

export default DocumentType;
