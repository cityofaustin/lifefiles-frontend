import React, {Component} from 'react';
import classNames from 'classnames';
import './ImageWithStatus.scss';
import ProgressIndicator from './ProgressIndicator';

interface ImageWithStatusProps {
  imageUrl: string;
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
    const {imageUrl} = {...this.props};
    const {imageStatus} = {...this.state};
    return (
      <div className="document-image">
        { (imageStatus === 'loading') &&
        <div className="loading-outter">
          <div className="loading-inner">
            <ProgressIndicator />
          </div>
        </div>
        }
        <img
          className={classNames({
            'document-summary-image-loading': imageStatus === 'loading',
            'document-summary-image': true})}
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
