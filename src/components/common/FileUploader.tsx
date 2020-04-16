import React, {Component, Fragment} from 'react';
import Dropzone from 'react-dropzone';
import './FileUploader.scss';
import {ReactComponent as ReuploadBtnSvg} from '../../img/reupload-btn.svg';
import {ReactComponent as ReuploadSmSvg} from '../../img/reupload-sm.svg';
import StringUtil from '../../util/StringUtil';
import CryptoUtil from '../../util/CryptoUtil';
import ZipUtil from '../../util/ZipUtil';

interface FileUploaderState {
  files: File[];
}

interface FileUploaderProps {
  setFile: (file?: File) => void;
  documentType?: string;
  privateEncryptionKey?: string;
}

class FileUploader extends Component<FileUploaderProps, FileUploaderState> {
  constructor(props: Readonly<FileUploaderProps>) {
    super(props);

    this.state = {
      files: []
    };
  }

  reuploadFiles = () => {
    const {setFile} = {...this.props};
    setFile(undefined);
    this.setState({files: []});
  };

  handleOnDrop = async (acceptedFiles: File[]) => {
    const {setFile, privateEncryptionKey} = {...this.props};
    acceptedFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    );
    const [oneFile] = [...acceptedFiles];
    const base64String = await StringUtil.fileContentsToString(oneFile);
    const encryptedString = await CryptoUtil.getEncryptedString(privateEncryptionKey!, base64String);
    const zipped: Blob = await ZipUtil.zip(encryptedString);
    const newZippedFile = new File([zipped], 'encrypted-image.zip', {
      type: 'application/zip',
      lastModified: Date.now()
    });
    this.setState({files: acceptedFiles});
    setFile(newZippedFile);
  };

  renderFiles(files: File[]) {
    const {documentType} = {...this.props};
    if (files.length > 0) {
      const [oneFile] = [...files];
      return (
        <div className="file-preview">
          {/*{(oneFile as any).path} - {oneFile.size} bytes*/}
          <div className="file-image">
            <img
              className={'document-summary-image'}
              src={(oneFile as any).preview}
              alt={''}
            />
          </div>
          <div className="file-info">
            <div className="file-info-items">
              <div className="file-info-item">
                <div className="file-info-title">FILE NAME</div>
                <div>{(oneFile as any).path}</div>
              </div>
              {documentType && (
                <div className="file-info-item">
                  <div className="file-info-title">DOCUMENT NAME</div>
                  <div>{documentType}</div>
                </div>
              )}
            </div>
            <div className="file-reupload">
              <div>Not the right file?</div>
              <ReuploadBtnSvg
                style={{cursor: 'pointer'}}
                onClick={this.reuploadFiles}
              />
            </div>
          </div>
        </div>
      );
    } else {
      return <Fragment/>;
    }
  }

  renderForm(getRootProps: any, getInputProps: any) {
    return (
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <ReuploadSmSvg className="upload-sm"/>
        <svg className="upload" width="997" height="327" viewBox="0 0 997 327">
          <defs>
            <filter
              id="filter1"
              x="347"
              y="136"
              width="291"
              height="89"
              filterUnits="userSpaceOnUse"
            >
              <feOffset dy="3"/>
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feFlood floodOpacity="0.161"/>
              <feComposite operator="in" in2="blur"/>
              <feComposite in="SourceGraphic"/>
            </filter>
          </defs>
          <g transform="translate(-468 -319)">
            <g transform="translate(468 319)">
              <g
                fill="#fff"
                stroke="#707070"
                strokeWidth="2"
                strokeDasharray="10 15"
                opacity="0.6"
              >
                <rect width="997" height="327" stroke="none"/>
                <rect x="1" y="1" width="995" height="325" fill="none"/>
              </g>
              <text
                id="Upload_your_file_by_dropping_it_here..."
                data-name="Upload your file by dropping it here..."
                transform="translate(23 38)"
                fill="#484848"
                fontSize="25"
                fontFamily="Montserrat"
                opacity="0.6"
              >
                <tspan x="0" y="0">
                  Upload your file by dropping it here...
                </tspan>
              </text>
            </g>
            <g transform="translate(824 433)">
              <g transform="translate(-848 -422)">
                <g
                  transform="matrix(1, 0, 0, 1, 492, 308)"
                  filter="url(#filter1)"
                >
                  <rect
                    width="273"
                    height="71"
                    rx="11"
                    transform="translate(356 142)"
                    fill="#fff"
                  />
                </g>
                <g transform="translate(857 465)" opacity="0.6">
                  <g data-name="Group 1032" transform="translate(24.867)">
                    <g data-name="Group 1031" transform="translate(0)">
                      <path
                        d="M147.951,10.567,139.084.433a1.264,1.264,0,0,0-1.905,0l-8.867,10.133a1.266,1.266,0,0,0,.953,2.1h5.067V29.133A1.267,1.267,0,0,0,135.6,30.4h5.067a1.267,1.267,0,0,0,1.267-1.267V12.667H147a1.266,1.266,0,0,0,.953-2.1Z"
                        transform="translate(-127.998)"
                        fill="#484848"
                      />
                    </g>
                  </g>
                  <g transform="translate(16 27.867)">
                    <g transform="translate(0)">
                      <path
                        d="M48.933,352v7.6H21.067V352H16v10.133a2.533,2.533,0,0,0,2.533,2.533H51.467A2.531,2.531,0,0,0,54,362.133V352Z"
                        transform="translate(-16 -352)"
                        fill="#484848"
                      />
                    </g>
                  </g>
                </g>
                <text
                  transform="translate(931 497)"
                  fill="#484848"
                  fontSize="30"
                  fontFamily="Montserrat"
                  opacity="0.6"
                >
                  <tspan x="0" y="0">
                    Upload File
                  </tspan>
                </text>
              </g>
              <text
                transform="translate(136.5 19)"
                fill="#484848"
                fontSize="25"
                fontFamily="Montserrat"
                opacity="0.4"
              >
                <tspan x="-112" y="0">
                  or by clicking here
                </tspan>
              </text>
            </g>
          </g>
        </svg>
      </div>
    );
  }

  render() {
    const {files} = {...this.state};
    // const {acceptedFiles, getRootProps, getInputProps} = useDropzone();
    //
    // const files = acceptedFiles.map(file => (

    // ));

    return (
      <Dropzone onDrop={this.handleOnDrop}>
        {({getRootProps, getInputProps}) => (
          <section className="dropzone-container">
            {files.length <= 0 && this.renderForm(getRootProps, getInputProps)}
            {files.length > 0 && this.renderFiles(files)}
          </section>
        )}
      </Dropzone>
    );
  }
}

export default FileUploader;
