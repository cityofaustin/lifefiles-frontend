import React, { Component, Fragment } from 'react';

import HttpStatusCode from '../../../models/HttpStatusCode';
import AccountService from '../../../services/AccountService';
import HelperEmail, { HelperEmailState } from './HelperEmail';
import HelperProfile, { HelperProfileState } from './HelperProfile';
import HelperOverview from './HelperOverview';
import HelperLoginMethod, { HelperLoginMethodState } from './HelperLoginMethod';
import HelperLoginSetup, { HelperLoginSetupState } from './HelperLoginSetup';
import NotarySetup, { NotarySetupState } from './NotarySetup';
import { LoginOption } from '../../svg/HelperLoginOption';
import CryptoUtil from '../../../util/CryptoUtil';
import './HelperRegister.scss';
import { HelperAccountRequest } from '../../../models/auth/HelperRegisterRequest';
import APIError from '../../../services/APIError';
import RegisterAndLogin from './RegisterAndLogin';
import delay from '../../../util/delay';
import { ANIMATION_TIMEOUT } from '../../../util/animation-util';
import AppSetting from '../../../models/AppSetting';

interface HelperRegisterState {
  isAnimatingForward: boolean;
  isAnimatingBackward: boolean;
  email: string;
  fullname: string;
  step: number;
  previewURL?: string;
  file?: File;
  thumbnailFile?: File;
  selectedOption?: LoginOption;
  password: string;
  errorMessage: string;
  notaryId: string;
  notaryState: string;
}
interface HelperRegisterProps {
  appSettings: AppSetting[];
  handleLogin: (loginResponse: any) => Promise<void>;
  goBack: () => void;
}
export default class HelperRegister extends Component<
  HelperRegisterProps,
  HelperRegisterState
> {
  state = {
    isAnimatingForward: false,
    isAnimatingBackward: false,
    email: '',
    fullname: '',
    step: 0,
    // step: 6,
    previewURL: '',
    // selectedOption: undefined as any,
    selectedOption: LoginOption.PrivateKey as any,
    password: '',
    errorMessage: '',
    notaryId: '',
    notaryState: '',
    file: undefined,
    thumbnailFile: undefined,
  };

  handleRegister = async () => {
    const {
      email,
      fullname,
      password,
      selectedOption,
      notaryId,
      notaryState,
      file,
    } = { ...this.state };
    // const { fullname, previewURL } = { ...this.state };
    // notary things
    let { errorMessage } = { ...this.state };
    const username = this.state.email.split('@')[0];
    const firstname =
      fullname.split(' ').length > 0 ? fullname.split(' ')[0] : fullname;
    const lastname =
      fullname.split(' ').length > 1
        ? fullname.substr(firstname.length + 1, fullname.length)
        : '';
    const accountBody: HelperAccountRequest = {
      email,
      password,
      username,
      firstname,
      lastname,
      notaryId,
      notaryState,
    };
    const secureAccountbody: HelperAccountRequest = {
      email,
      password: 'isnotused',
      username: '',
      firstname,
      lastname,
      notaryId,
      notaryState,
      publicEncryptionKey: '',
    };
    if (selectedOption === LoginOption.PrivateKey) {
      window.sessionStorage.setItem('bring-your-own-key', password);
      const publicKey = CryptoUtil.getPublicKeyByPrivateKey('0x' + password);
      const address = CryptoUtil.getAddressByPublicKey(publicKey);
      secureAccountbody.username = address;
      secureAccountbody.publicEncryptionKey = publicKey;
    }

    try {
      let registerResponse;
      if (selectedOption === LoginOption.PrivateKey) {
        registerResponse = await AccountService.registerHelperAccount({
          account: secureAccountbody,
          file: file!,
        });
      } else {
        registerResponse = await AccountService.registerHelperAccount({
          account: accountBody,
          file: file!,
        });
      }

      if (registerResponse === undefined) {
        throw new Error('Server unavailable.');
      }
      try {
        await this.props.handleLogin(registerResponse);
        return;
      } catch (err) {
        if (
          err &&
          [
            HttpStatusCode.UNPROCESSABLE_ENTITY,
            HttpStatusCode.INTERNAL_SERVER_ERROR,
          ].includes(Number(err.message))
        ) {
          errorMessage = 'Unable to log in with provided credentials.';
        } else {
          errorMessage =
            'Oops, something went wrong. Please try again in a few minutes.';
        }
      }
    } catch (err) {
      console.error(err.message);
      if (err instanceof APIError) {
        errorMessage = '';
        let idx = 0;
        for (const k of Object.keys(err.response.msg.errors)) {
          errorMessage += idx > 0 ? '\n' : '';
          errorMessage += `${err.response.msg.errors[k].path} ${err.response.msg.errors[k].message}`;
          idx++;
        }
      } else {
        errorMessage =
          'Oops, something went wrong. Please try again in a few minutes.';
      }
    }
    this.setState({ errorMessage, step: 0 }, async () => {
      await delay(ANIMATION_TIMEOUT);
      const elObj = this.getElObj();
      elObj.wave.style.transition = 'none';
      elObj.wave.style.transform = 'translateX(0px)';
      await delay(ANIMATION_TIMEOUT);
      elObj.wave.style.transition = '';
    });
  };

  goBack = async () => {
    let { step } = { ...this.state };
    const { goBack } = { ...this.props };
    if (step === 0) {
      goBack();
      return;
    }
    this.setState({ isAnimatingBackward: true });
    await delay(100);
    const elObj = this.getElObj();
    // debugger;
    elObj.helper[step]!.style.transform = `translateX(360px)`;
    elObj.helper[step]!.style.opacity = '0';
    step--;
    (elObj.wave as any).style.transform = `translateX(-${step * 360}px)`;
    await delay(1500);
    this.setState({ step, isAnimatingBackward: false });
  };

  goForward = async (prevCardState?: any) => {
    let {
      step,
      email,
      fullname,
      previewURL,
      file,
      thumbnailFile,
      selectedOption,
      password,
      notaryId,
      notaryState,
    } = {
      ...this.state,
    };
    switch (step) {
      case 0:
        ({ email, fullname } = { ...(prevCardState as HelperEmailState) });
        break;
      case 1:
        previewURL = (prevCardState as HelperProfileState).previewURL!;
        file = prevCardState.file;
        thumbnailFile = prevCardState.thumbnailFile;
        break;
      case 2:
        break; // overview has no state
      case 3:
        selectedOption = (prevCardState as HelperLoginMethodState)
          .selectedOption!;
        break;
      case 4:
        password = (prevCardState as HelperLoginSetupState).password;
        break;
      case 5:
        if (prevCardState) {
          ({ notaryId, notaryState } = {
            ...(prevCardState as NotarySetupState),
          });
        }
        break;
    }
    await delay(ANIMATION_TIMEOUT);
    const elObj = this.getElObj();
    elObj.helper[step]!.style.transform = 'translateX(-360px)';
    elObj.helper[step]!.style.opacity = '0';
    step++;
    (elObj.wave as any).style.transform = `translateX(-${step * 360}px)`;
    this.setState({
      step,
      email,
      fullname,
      previewURL,
      file,
      thumbnailFile,
      selectedOption,
      password,
      notaryId,
      notaryState,
      isAnimatingForward: true,
    });
    await delay(1500);
    this.setState({ isAnimatingForward: false }, () => {
      if (this.state.step === 6) {
        this.handleRegister();
      }
    });
  };

  getElObj() {
    return {
      body: document.body,
      wave: document.getElementsByClassName('wave-container')[0] as HTMLElement,
      helper: [
        document.getElementById('section-0-helper'),
        document.getElementById('section-1-helper'),
        document.getElementById('section-2-helper'),
        document.getElementById('section-3-helper'),
        document.getElementById('section-4-helper'),
        document.getElementById('section-5-helper'),
        document.getElementById('section-6-helper'),
      ],
    };
  }

  render() {
    const {
      email,
      fullname,
      previewURL,
      file,
      step,
      selectedOption,
      password,
      errorMessage,
      notaryId,
      notaryState,
      isAnimatingForward,
      isAnimatingBackward,
    } = {
      ...this.state,
    };
    const {appSettings} = {...this.props};
    let section = <Fragment />;
    switch (step) {
      case 0:
        section = (
          <HelperEmail
            errorMessage={errorMessage}
            email={email}
            fullname={fullname}
            goBack={this.goBack}
            goForward={this.goForward}
          />
        );
        break;
      case 1:
        if (isAnimatingForward) {
          section = (
            <Fragment>
              <HelperEmail
                errorMessage={errorMessage}
                email={email}
                fullname={fullname}
                goBack={this.goBack}
                goForward={this.goForward}
              />
              <HelperProfile
                email={email}
                fullname={fullname}
                previewURL={previewURL}
                file={file}
                goBack={this.goBack}
                goForward={this.goForward}
                position="right"
              />
            </Fragment>
          );
        } else if (isAnimatingBackward) {
          section = (
            <Fragment>
              <HelperEmail
                position="left"
                errorMessage={errorMessage}
                email={email}
                fullname={fullname}
                goBack={this.goBack}
                goForward={this.goForward}
              />
              <HelperProfile
                email={email}
                fullname={fullname}
                previewURL={previewURL}
                file={file}
                goBack={this.goBack}
                goForward={this.goForward}
              />
            </Fragment>
          );
        } else {
          section = (
            <HelperProfile
              email={email}
              fullname={fullname}
              previewURL={previewURL}
              file={file}
              goBack={this.goBack}
              goForward={this.goForward}
            />
          );
        }
        break;
      case 2:
        if (isAnimatingForward) {
          section = (
            <Fragment>
              <HelperProfile
                email={email}
                fullname={fullname}
                previewURL={previewURL}
                file={file}
                goBack={this.goBack}
                goForward={this.goForward}
              />
              <HelperOverview
                goBack={this.goBack}
                goForward={this.goForward}
                position="right"
              />
            </Fragment>
          );
        } else if (isAnimatingBackward) {
          section = (
            <Fragment>
              <HelperProfile
                email={email}
                fullname={fullname}
                previewURL={previewURL}
                file={file}
                goBack={this.goBack}
                goForward={this.goForward}
                position="left"
              />
              <HelperOverview goBack={this.goBack} goForward={this.goForward} />
            </Fragment>
          );
        } else {
          section = (
            <HelperOverview goBack={this.goBack} goForward={this.goForward} />
          );
        }
        break;
      case 3:
        if (isAnimatingForward) {
          section = (
            <Fragment>
              <HelperOverview goBack={this.goBack} goForward={this.goForward} />
              <HelperLoginMethod
                goBack={this.goBack}
                goForward={this.goForward}
                position="right"
              />
            </Fragment>
          );
        } else if (isAnimatingBackward) {
          section = (
            <Fragment>
              <HelperOverview
                goBack={this.goBack}
                goForward={this.goForward}
                position="left"
              />
              <HelperLoginMethod
                goBack={this.goBack}
                goForward={this.goForward}
              />
            </Fragment>
          );
        } else {
          section = (
            <HelperLoginMethod
              goBack={this.goBack}
              goForward={this.goForward}
            />
          );
        }
        break;
      case 4:
        if (isAnimatingForward) {
          section = (
            <Fragment>
              <HelperLoginMethod
                goBack={this.goBack}
                goForward={this.goForward}
              />
              <HelperLoginSetup
                password={password}
                selectedOption={selectedOption}
                goBack={this.goBack}
                goForward={this.goForward}
                position="right"
              />
            </Fragment>
          );
        } else if (isAnimatingBackward) {
          section = (
            <Fragment>
              <HelperLoginMethod
                goBack={this.goBack}
                goForward={this.goForward}
                position="left"
              />
              <HelperLoginSetup
                password={password}
                selectedOption={selectedOption}
                goBack={this.goBack}
                goForward={this.goForward}
              />
            </Fragment>
          );
        } else {
          section = (
            <HelperLoginSetup
              password={password}
              selectedOption={selectedOption}
              goBack={this.goBack}
              goForward={this.goForward}
            />
          );
        }
        break;
      case 5:
        if (isAnimatingForward) {
          section = (
            <Fragment>
              <HelperLoginSetup
                password={password}
                selectedOption={selectedOption}
                goBack={this.goBack}
                goForward={this.goForward}
              />
              <NotarySetup
                notaryId={notaryId}
                notaryState={notaryState}
                goBack={this.goBack}
                goForward={this.goForward}
                position="right"
              />
            </Fragment>
          );
        } else if (isAnimatingBackward) {
          section = (
            <Fragment>
              <HelperLoginSetup
                password={password}
                selectedOption={selectedOption}
                goBack={this.goBack}
                goForward={this.goForward}
                position="left"
              />
              <NotarySetup
                notaryId={notaryId}
                notaryState={notaryState}
                goBack={this.goBack}
                goForward={this.goForward}
              />
            </Fragment>
          );
        } else {
          section = (
            <NotarySetup
              notaryId={notaryId}
              notaryState={notaryState}
              goBack={this.goBack}
              goForward={this.goForward}
            />
          );
        }
        break;
      case 6:
        if (isAnimatingForward) {
          section = (
            <Fragment>
              <NotarySetup
                notaryId={notaryId}
                notaryState={notaryState}
                goBack={this.goBack}
                goForward={this.goForward}
              />
              <RegisterAndLogin appSettings={appSettings} position="right" />
            </Fragment>
          );
        } else {
          section = <RegisterAndLogin appSettings={appSettings} />;
        }
      default:
        break;
    }
    return <section className="helper-register container">{section}</section>;
  }
}
