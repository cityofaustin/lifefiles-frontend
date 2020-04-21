import DocumentTypeService from './DocumentTypeService';
import Document from '../models/document/Document';
import DocumentType from '../models/DocumentType';

describe('DocumentTypeService', () => {
  it('should get a match and not get a match', () => {
    const documents: Document[] = [
      {
        'sharedWithAccountIds': [],
        'url': '25f107ddbeea166a729f95fbc096e114.png',
        'thumbnailUrl': '25f107ddbeea166a729f95fbc096e114.png',
        'type': 'Driver\'s License',
        'hash': '966318d866dc4ba7b0a638e8483cd23f',
        'createdAt': new Date(),
        'updatedAt': new Date()
      },
      {
        'sharedWithAccountIds': [],
        'url': 'f3ade15eaa879572df44d39b89499ff7.png',
        'thumbnailUrl': '25f107ddbeea166a729f95fbc096e114.png',
        'type': 'Social Security Card',
        'hash': '658b57fa09be2a44b307a485afe78ab2',
        'createdAt': new Date(),
        'updatedAt': new Date()
      }
    ];
    const documentTypeMatch: string = 'Driver\'s License';
    const documentTypeNonMatch: string = 'Passport';
    const result1 = DocumentTypeService.findDocumentTypeMatchInDocuments(documentTypeMatch, documents);
    const result2 = DocumentTypeService.findDocumentTypeMatchInDocuments(documentTypeNonMatch, documents);
    expect(result1).toBeTruthy();
    expect(result2).toBeFalsy();
  });
});
