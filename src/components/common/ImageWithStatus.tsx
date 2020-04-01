import React, {Component} from 'react';
import classNames from 'classnames';
import './ImageWithStatus.scss';
import ProgressIndicator from './ProgressIndicator';

interface ImageWithStatusProps {
  imageUrl: string;
  isCircle?: boolean;
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

  handleImageLoaded = () => {
    this.setState({ imageStatus: ImageStatus.Loaded });
  };

  handleImageErrored = () => {
    this.setState({ imageStatus: ImageStatus.Failed });
  };

  render() {
    const {imageUrl, isCircle} = {...this.props};
    const {imageStatus} = {...this.state};
    return (
      <div className="image-with-status">
        { (imageStatus === 'loading') &&
        <div className={classNames({'loading-outter': true,
          'outter-doc': !isCircle, 'outter-circle': isCircle})}>
          <div className="loading-inner">
            <ProgressIndicator />
          </div>
        </div>
        }
        <img
          className={classNames({
            'loading': imageStatus === 'loading',
            'image-doc': !isCircle, 'img-circle': isCircle})}
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
