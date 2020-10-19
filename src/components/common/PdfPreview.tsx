import { Document, Page, pdfjs, PDFDownloadLink } from 'react-pdf';
import React, { Component } from 'react';
import './PdfPreview.scss';
import ProgressIndicator from './ProgressIndicator';

// TODO fix this with webpack
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfPreviewProps {
  fileURL: string;
  height?: number;
}

interface PdfPreviewState {
  pageNumber: number;
  numPages?: number;
}

class PdfPreview extends Component<PdfPreviewProps, PdfPreviewState> {
  static defaultProps = {
    height: 650,
  };

  constructor(props) {
    super(props);
    this.state = {
      pageNumber: 1,
      numPages: undefined,
    };
  }

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages });
  };

  handlePageChange = (newPageNumber) => {
    const { pageNumber, numPages } = { ...this.state };
    let setPageNumber = pageNumber;
    if(numPages) {
      if (newPageNumber > 0 && newPageNumber <= numPages) {
        setPageNumber = newPageNumber;
      }
    }
    this.setState({ pageNumber: setPageNumber });
  };

  render() {
    const { fileURL, height } = { ...this.props };
    const { pageNumber } = { ...this.state };
    return (
      <div className="pdf-container">
        <Document
          error={(<div>Failed to load PDF file.</div>)}
          loading={(<ProgressIndicator />)}
          title=""
          file={fileURL}
          onLoadSuccess={this.onDocumentLoadSuccess}
        >
          <Page
            pageNumber={pageNumber}
            // customTextRenderer={({ str, itemIndex }) => { return (<span>{str}</mark>) }}
            height={height}
          />
        </Document>
        <div className="paginate">
          <span
            className="prev"
            onClick={() => {
              this.handlePageChange(pageNumber - 1);
            }}
          >
            prev
          </span>
          <span className="status">
            Page {pageNumber} of {this.state.numPages}
          </span>
          <span
            className="next"
            onClick={() => this.handlePageChange(pageNumber + 1)}
          >
            next
          </span>
        </div>
      </div>
    );
  }
}

export default PdfPreview;
