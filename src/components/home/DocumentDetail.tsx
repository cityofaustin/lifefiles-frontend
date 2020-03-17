// import React, {Component, Fragment} from 'react';
// import {Breadcrumb, BreadcrumbItem, ListGroup, ListGroupItem} from 'reactstrap';
// import Document from '../../models/Document';
// import DocumentService from '../../services/DocumentService';
// import StringUtil from '../../util/StringUtil';
//
// interface DocumentDetailProps {
//   document: Document;
//   goBack: () => void;
// }
//
// class DocumentDetail extends Component<DocumentDetailProps> {
//
//   constructor(props: Readonly<DocumentDetailProps>) {
//     super(props);
//   }
//
//   render() {
//     const {document, goBack} = {...this.props};
//     return (
//       <div className="main-content">
//         <Breadcrumb className="padding-bottom-12">
//           <BreadcrumbItem className="breadcrumb-link" onClick={goBack}>My Documents</BreadcrumbItem>
//           <BreadcrumbItem active>Driver's License</BreadcrumbItem>
//         </Breadcrumb>
//         <img className="document-summary-image"
//              src={DocumentService.getDocumentURL(document.url)}
//              alt="doc missing"
//         />
//         <div className="title padding-top-12">{document.type}</div>
//         <div className="subtitle padding-bottom-12">SHARED WITH</div>
//         {document.sharedWithAccountIds.length < 1 && (
//           <div>No documents are being shared.</div>
//         )}
//         <ListGroup>
//           {document.sharedWithAccountIds.map((sharedWithAccountId, idx) => {
//             return (
//               <ListGroupItem key={idx} className="justify-content-between">
//                 {/*<img className="shared-with-image-single"*/}
//                 {/*     src={sharedWithItem.profileimgUrl}*/}
//                 {/*     alt={`sharedWithItem${idx}`}*/}
//                 {/*/>*/}
//                 <div style={{display: 'inline-block'}}>
//                   {`Account ID: ${sharedWithAccountId}`}
//                 </div>
//               </ListGroupItem>
//             );
//           })}
//         </ListGroup>
//       </div>
//     );
//   }
// }
//
// export default DocumentDetail;
