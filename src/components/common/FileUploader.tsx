import React, {Component, Fragment} from 'react';
import Dropzone from 'react-dropzone';
import './FileUploader.scss';

interface FileUploaderState {
  files: File[];
}

interface FileUploaderProps {
  setFile: (file: File) => void;
}

class FileUploader extends Component<FileUploaderProps, FileUploaderState> {
  // private acceptedFiles: Folder[];
  // private readonly getRootProps: (props?: DropzoneRootProps) => DropzoneRootProps;
  // private readonly getInputProps: (props?: DropzoneInputProps) => DropzoneInputProps;
  // private readonly files: JSX.Element[];
  //
  constructor(props: Readonly<FileUploaderProps>) {
    super(props);

    this.state = {
      files: []
    };
    //
    //   const {acceptedFiles, getRootProps, getInputProps} = useDropzone();
    //   this.acceptedFiles = acceptedFiles;
    //   this.getRootProps = getRootProps;
    //   this.getInputProps = getInputProps;
    //   this.files = this.acceptedFiles.map((file: Folder) => (
    //     <li key={(file as any).path}>
    //       {(file as any).path} - {file.size} bytes
    //     </li>
    //   ));
  }

  handleOnDrop = (acceptedFiles: File[]) => {
    const {setFile} = {...this.props};
    const [oneFile] = [...acceptedFiles];
    this.setState({files: acceptedFiles});
    setFile(oneFile);
  };

  renderFiles(files: File[]) {
    if(files.length > 0) {
      const [oneFile] = [...files];
      return (
        <li key={(oneFile as any).path}>
          {(oneFile as any).path} - {oneFile.size} bytes
        </li>
      );
    } else {
      return <Fragment />;
    }
  }

  render() {
    const {files} = {...this.state};
    // const {acceptedFiles, getRootProps, getInputProps} = useDropzone();
    //
    // const files = acceptedFiles.map(file => (

    // ));
    //
    // return (
    //   <section className="container">
    //     <div {...getRootProps({className: 'dropzone'})}>
    //       <input {...getInputProps()} />
    //       <p>Drag 'n' drop some files here, or click to select files</p>
    //     </div>
    //     <aside>
    //       <h4>Files</h4>
    //       <ul>{files}</ul>
    //     </aside>
    //   </section>
    // );
    return (
      <Dropzone onDrop={this.handleOnDrop}>
        {({getRootProps, getInputProps}) => (
          <section className="container">
            <div className="dropzone" {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Drag 'n' drop file here, or click to select file</p>
            </div>
            <aside className="file-list">
              <h4>File</h4>
              <ul>{this.renderFiles(files)}</ul>
            </aside>
          </section>
        )}
      </Dropzone>
    );
  }
}

export default FileUploader;
