import React, { Component, Fragment } from 'react';
import GoBackSvg from '../../svg/GoBackSvg';
import FileUploader, { FileUploaderThemeEnum } from '../../common/FileUploader';
import { ReactComponent as ChangePictureBtnSvg } from '../../../img/change-picture.svg';
import { handleIOSBrowser } from '../../../util/browser-util';
import { animateIn, getSectionClassName } from '../../../util/animation-util';
interface HelperProfileProps {
  email: string;
  fullname: string;
  previewURL: string;
  file?: File;
  goBack: () => void;
  goForward: (prevCardState: HelperProfileState) => void;
  position?: string;
}
export interface HelperProfileState {
  previewURL?: string;
  file?: File;
  thumbnailFile?: File;
}
export default class HelperProfile extends Component<
  HelperProfileProps,
  HelperProfileState
> {
  constructor(props) {
    super(props);
    const { previewURL, file } = { ...this.props };
    this.state = {
      previewURL,
      file,
      thumbnailFile: undefined,
    };
  }
  componentDidMount() {
    handleIOSBrowser();
    animateIn(this.refs.section);
  }
  setFile = async (file?: File, thumbnailFile?: File, previewURL?: string) => {
    this.setState({ previewURL, file, thumbnailFile });
  };

  render() {
    const { previewURL } = { ...this.state };
    const { goBack, goForward, email, fullname } = { ...this.props };
    return (
      <div
        ref="section"
        id="section-1-helper"
        className={getSectionClassName(this.props.position)}
      >
        <div className="section-contents">
          <div className="title1">Document Helper</div>
          <div className="subtitle">Ok, let's pick a username</div>
          <div className="card owner1">
            <div className="card-body">
              <div className="card-body-section" style={{ marginTop: 0 }}>
                <div className="helper-login">A photo of you</div>
                <div className="comment">
                  So that document owners can make sure they're adding the right
                  person
                </div>
              </div>
              <div className="card-body-section1">
                <div style={{ display: !previewURL ? 'block' : 'none' }}>
                  <FileUploader
                    ref="fileUploader"
                    theme={FileUploaderThemeEnum.Profile}
                    setFile={this.setFile}
                  />
                  <div className="comment">
                    Please make sure your photo shows your face clearly
                  </div>
                </div>
                {previewURL && (
                  <img
                    className="profile-img"
                    src={previewURL}
                    width="125"
                    height="125"
                  />
                )}
              </div>
              {previewURL && (
                <Fragment>
                  <div className="profile-section">
                    <div className="fullname">{fullname}</div>
                    <div className="profile-email-section">
                      <div className="email-label">E-mail</div>
                      <div className="email-value">{email}</div>
                    </div>
                  </div>
                  <div className="profile-section">
                    <div className="change-picture-label">Not quite right?</div>
                    <div
                      onClick={() => {
                        (this.refs
                          .fileUploader as FileUploader).reuploadFiles();
                      }}
                    >
                      <ChangePictureBtnSvg />
                    </div>
                  </div>
                </Fragment>
              )}
              <div className="bottom">
                <input
                  style={{ width: '210px', marginTop: '27px' }}
                  type="button"
                  value="Next"
                  disabled={!previewURL}
                  onClick={() => goForward(this.state)}
                />
              </div>
            </div>
          </div>
          <GoBackSvg color="#4BA9D9" goBack={goBack} />
        </div>
      </div>
    );
  }
}
