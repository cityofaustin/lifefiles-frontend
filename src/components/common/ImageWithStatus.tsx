import React, {Component} from 'react';
import classNames from 'classnames';
import './ImageWithStatus.scss';
import ProgressIndicator from './ProgressIndicator';
import DocumentService from '../../services/DocumentService';
import APIService from '../../services/APIService';

export enum ImageViewTypes {
  GRID_LAYOUT,
  GRID_CIRCLE_LAYOUT,
  LIST_LAYOUT
}

interface ImageWithStatusProps {
  imageUrl: string;
  imageViewType: ImageViewTypes;
}

interface ImageWithStatusState {
  imageStatus: ImageStatus;
}

enum ImageStatus {
  Loading = 'loading',
  Failed = 'failed to load',
  Loaded = 'loaded'
}

class ImageWithStatus extends Component<ImageWithStatusProps, ImageWithStatusState> {
  constructor(props: Readonly<ImageWithStatusProps>) {
    super(props);
    this.state = {
      imageStatus: ImageStatus.Loading
    };
  }

  async componentDidMount(): Promise<void> {
    const {imageUrl} = {...this.props};
    await this.unzipAndDecrypt(imageUrl);
  }

  handleImageLoaded = () => {
    this.setState({ imageStatus: ImageStatus.Loaded });
  };

  handleImageErrored = () => {
    this.setState({ imageStatus: ImageStatus.Failed });
  };

  async unzipAndDecrypt(zipUrl: string) {
    // const url = await DocumentService.getDocumentURL();
    // debugger;
    const zippedFileContents = await APIService.getText(zipUrl);
    console.log(zippedFileContents);
  }

  render() {
    const {imageUrl, imageViewType} = {...this.props};
    const {imageStatus} = {...this.state};
    return (
      <div className="image-with-status">
        { (imageStatus === 'loading') &&
        <div className={
          classNames({'loading-outter': true,
            'outter-doc': imageViewType === ImageViewTypes.GRID_LAYOUT,
            'outter-circle': imageViewType === ImageViewTypes.GRID_CIRCLE_LAYOUT,
            'outter-list': imageViewType === ImageViewTypes.LIST_LAYOUT
          })}
        >
          <div className="loading-inner">
            <ProgressIndicator />
          </div>
        </div>
        }
        <img
          className={classNames({
            'loading': imageStatus === 'loading',
            'image-doc': imageViewType === ImageViewTypes.GRID_LAYOUT,
            'img-circle': imageViewType === ImageViewTypes.GRID_CIRCLE_LAYOUT,
            'list-img' : imageViewType === ImageViewTypes.LIST_LAYOUT
          })}
          src={imageUrl}
          onLoad={this.handleImageLoaded}
          onError={this.handleImageErrored}
          alt={''}
        />
        {/*{imageStatus}*/}
      </div>
    );
  }
}

export default ImageWithStatus;
