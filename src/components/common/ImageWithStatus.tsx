import React, { Component, Fragment } from 'react';
import classNames from 'classnames';
import './ImageWithStatus.scss';
import ProgressIndicator from './ProgressIndicator';
import ZipUtil from '../../util/ZipUtil';
import CryptoUtil from '../../util/CryptoUtil';

export enum ImageViewTypes {
  GRID_LAYOUT,
  GRID_CIRCLE_LAYOUT,
  LIST_LAYOUT,
  PREVIEW
}

interface ImageWithStatusProps {
  imageUrl?: string;
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
  Loaded = 'loaded'
}

class ImageWithStatus extends Component<ImageWithStatusProps,
  ImageWithStatusState> {
  constructor(props: Readonly<ImageWithStatusProps>) {
    super(props);
    this.state = {
      imageStatus: ImageStatus.Loading
    };
  }

  async componentDidUpdate(prevProps: Readonly<ImageWithStatusProps>) {
    if (this.props.imageUrl && this.props.imageUrl !== prevProps.imageUrl
      && this.props.encrypted && this.props.privateEncryptionKey) {
      let base64Image: string = '';
      const encryptedString: string = await ZipUtil.unzip(this.props.imageUrl);
      base64Image = await CryptoUtil.getDecryptedString(this.props.privateEncryptionKey!, encryptedString);
      this.setState({ base64Image });
    }
  }

  async componentDidMount(): Promise<void> {
    let { imageStatus } = {...this.state};
    const { imageUrl, encrypted, privateEncryptionKey } = { ...this.props };
    let base64Image: string = '';
    try {
      if (encrypted && imageUrl) {
        const encryptedString: string = await ZipUtil.unzip(imageUrl);
        base64Image = await CryptoUtil.getDecryptedString(privateEncryptionKey!, encryptedString);
      }
    } catch (err) {
      console.error(err);
      imageStatus = ImageStatus.Loaded;
    }
    this.setState({ base64Image, imageStatus });
  }

  handleImageLoaded = () => {
    this.setState({ imageStatus: ImageStatus.Loaded });
  };

  handleImageErrored = () => {
    this.setState({ imageStatus: ImageStatus.Failed });
  };

  render() {
    const { imageUrl, imageViewType, encrypted } = { ...this.props };
    const { imageStatus, base64Image } = { ...this.state };
    return (
      <Fragment>
        {/* <pre style={{width: '200px'}}>base64: {base64Image}</pre> */}
        <div className="image-with-status">
          {imageStatus === 'loading' && (
            <div
              className={classNames({
                'loading-outter': true,
                'outter-doc': imageViewType === ImageViewTypes.GRID_LAYOUT || ImageViewTypes.PREVIEW,
                'outter-circle':
                  imageViewType === ImageViewTypes.GRID_CIRCLE_LAYOUT,
                'outter-list': imageViewType === ImageViewTypes.LIST_LAYOUT
              })}
            >
              <div className="loading-inner">
                <ProgressIndicator />
              </div>
            </div>
          )}

          {encrypted && base64Image && base64Image.length > 0 && (
            <img
              className={classNames({
                loading: (imageStatus === 'loading' || base64Image === ''),
                'image-doc': imageViewType === ImageViewTypes.GRID_LAYOUT,
                'img-circle': imageViewType === ImageViewTypes.GRID_CIRCLE_LAYOUT,
                'list-img': imageViewType === ImageViewTypes.LIST_LAYOUT,
                'preview': imageViewType === ImageViewTypes.PREVIEW
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
                'preview': imageViewType === ImageViewTypes.PREVIEW
              })}
              src={imageUrl}
              onLoad={this.handleImageLoaded}
              onError={this.handleImageErrored}
              alt={''}
            />
          )}

          {/*{imageStatus}*/}
        </div>
      </Fragment>
    );
  }
}

export default ImageWithStatus;
