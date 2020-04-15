import React, {Component} from 'react';
import classNames from 'classnames';
import './ImageWithStatus.scss';
import ProgressIndicator from './ProgressIndicator';
import DocumentService from '../../services/DocumentService';
import APIService from '../../services/APIService';
import StringUtil from '../../util/StringUtil';

export enum ImageViewTypes {
  GRID_LAYOUT,
  GRID_CIRCLE_LAYOUT,
  LIST_LAYOUT,
}

interface ImageWithStatusProps {
  imageUrl: string;
  encrypted?: boolean;
  imageViewType: ImageViewTypes;
  privateEncryptionKey?: string;
}

interface ImageWithStatusState {
  imageStatus: ImageStatus;
  base64Image?: string;
}

enum ImageStatus {
  Loading = 'loading',
  Failed = 'failed to load',
  Loaded = 'loaded',
}

class ImageWithStatus extends Component<ImageWithStatusProps,
  ImageWithStatusState> {
  constructor(props: Readonly<ImageWithStatusProps>) {
    super(props);
    this.state = {
      imageStatus: ImageStatus.Loading,
    };
  }

  async componentDidMount(): Promise<void> {
    const {imageUrl, encrypted} = {...this.props};
    const base64Image = this.props.encrypted
      ? await this.unzipAndDecrypt(imageUrl, encrypted)
      : '';
    this.setState({base64Image});
  }

  handleImageLoaded = () => {
    this.setState({imageStatus: ImageStatus.Loaded});
  };

  handleImageErrored = () => {
    this.setState({imageStatus: ImageStatus.Failed});
  };

  async unzipAndDecrypt(zipUrl: string, encrypted?: boolean) {
    if (encrypted) {
      const base64Image = StringUtil.unzipString(
        zipUrl,
        this.props.privateEncryptionKey
      );
      return base64Image;
    }
  }

  render() {
    const {imageUrl, imageViewType, encrypted} = {...this.props};
    const {imageStatus, base64Image} = {...this.state};
    return (
      <div className="image-with-status">
        {imageStatus === 'loading' && (
          <div
            className={classNames({
              'loading-outter': true,
              'outter-doc': imageViewType === ImageViewTypes.GRID_LAYOUT,
              'outter-circle':
                imageViewType === ImageViewTypes.GRID_CIRCLE_LAYOUT,
              'outter-list': imageViewType === ImageViewTypes.LIST_LAYOUT,
            })}
          >
            <div className="loading-inner">
              <ProgressIndicator/>
            </div>
          </div>
        )}

        {encrypted && base64Image && (
          <img
            className={classNames({
              loading: imageStatus === 'loading',
              'image-doc': imageViewType === ImageViewTypes.GRID_LAYOUT,
              'img-circle': imageViewType === ImageViewTypes.GRID_CIRCLE_LAYOUT,
              'list-img': imageViewType === ImageViewTypes.LIST_LAYOUT,
            })}
            src={base64Image as string}
            onLoad={this.handleImageLoaded}
            onError={this.handleImageErrored}
            alt={''}
          />
        )}

        {!encrypted && (
          <img
            className={classNames({
              loading: imageStatus === 'loading',
              'image-doc': imageViewType === ImageViewTypes.GRID_LAYOUT,
              'img-circle': imageViewType === ImageViewTypes.GRID_CIRCLE_LAYOUT,
              'list-img': imageViewType === ImageViewTypes.LIST_LAYOUT,
            })}
            src={imageUrl}
            onLoad={this.handleImageLoaded}
            onError={this.handleImageErrored}
            alt={''}
          />
        )}

        {/*{imageStatus}*/}
      </div>
    );
  }
}

export default ImageWithStatus;
