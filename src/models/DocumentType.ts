interface DocumentType {
  name: string;
  fields: DocumentField[];
}

interface DocumentField {
  fieldName: string;
  required: boolean;
}

export default DocumentType;
