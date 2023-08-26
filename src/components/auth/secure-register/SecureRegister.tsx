import React, { Component, Fragment } from 'react';

import HttpStatusCode from '../../../models/HttpStatusCode';
import AccountService from '../../../services/AccountService';
import EmailCard, { EmailCardState } from './EmailCard';
import HelperProfile, { HelperProfileState } from './HelperProfile';
import HelperOverview from './HelperOverview';
import OwnerOverview from './OwnerOverview';
import SecureLoginMethod, { SecureLoginMethodState } from './SecureLoginMethod';
import SecureLoginSetup, { SecureLoginSetupState } from './SecureLoginSetup';
import NotarySetup, { NotarySetupState } from './NotarySetup';
import { LoginOption } from '../../svg/HelperLoginOption';
import CryptoUtil from '../../../util/CryptoUtil';
import './SecureRegister.scss';
import { HelperAccountRequest } from '../../../models/auth/HelperRegisterRequest';
import APIError from '../../../services/APIError';
import RegisterAndLogin from './RegisterAndLogin';
import delay from '../../../util/delay';
import { ANIMATION_TIMEOUT } from '../../../util/animation-util';
import AppSetting from '../../../models/AppSetting';
import Role from '../../../models/Role';

interface SecureRegisterState {
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
  duplicateEmail: boolean;
  notaryId: string;
  notaryState: string;
}
interface SecureRegisterProps {
  role: Role;
  appSettings: AppSetting[];
  handleLogin: (loginResponse: any) => Promise<void>;
  goBack: () => void;
  goToLogin: () => void;
}
export default class SecureRegister extends Component<
  SecureRegisterProps,
  SecureRegisterState
> {
  state = {
    isAnimatingForward: false,
    isAnimatingBackward: false,
    email: '',
    fullname: '',
    step: 0,
    // step: 3,
    previewURL: '',
    // selectedOption: undefined as any,
    selectedOption: LoginOption.PrivateKey as any,
    password: '',
    errorMessage: '',
    notaryId: '',
    notaryState: 'TX',
    file: undefined,
    thumbnailFile: undefined,
    duplicateEmail: false
  };

  handleRegister = async () => {
    const { role, appSettings } = { ...this.props };
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
    let { errorMessage, duplicateEmail } = { ...this.state };
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
      role,
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
      role,
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
        registerResponse = await AccountService.registerSecureAccount({
          account: secureAccountbody,
          file: file!,
        });
      } else {
        registerResponse = await AccountService.registerSecureAccount({
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
        if (errorMessage.includes('email is already taken')) {
          const titleSetting = appSettings.find(
            (a) => a.settingName === 'title'
          );
          const title = titleSetting ? titleSetting.settingValue : undefined;
          errorMessage = `The email address is already being used ${
            title ? ` on ${title}` : ''
          }, please click on "Go Back" or`;
          duplicateEmail = true;
        }
      } else {
        errorMessage =
          'Oops, something went wrong. Please try again in a few minutes.';
      }
    }
    this.setState({ errorMessage, duplicateEmail, step: 0 }, async () => {
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
    const { goBack, role } = { ...this.props };
    if (step === 0) {
      goBack();
      return;
    }
    this.setState({ isAnimatingBackward: true });
    await delay(100);
    const elObj = this.getElObj();
    elObj.helper[step]!.style.transform = `translateX(360px)`;
    elObj.helper[step]!.style.opacity = '0';
    if (step === 2 && role === Role.owner) {
      step -= 2;
    } else {
      step--;
    }
    (elObj.wave as any).style.transform = `translateX(-${step * 360}px)`;
    await delay(1500);
    this.setState({ step, isAnimatingBackward: false });
  };

  goForward = async (prevCardState?: any) => {
    const { role } = { ...this.props };
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
        ({ email, fullname } = { ...(prevCardState as EmailCardState) });
        break;
      case 1:
        previewURL = (prevCardState as HelperProfileState).previewURL!;
        file = prevCardState.file;
        thumbnailFile = prevCardState.thumbnailFile;
        break;
      case 2:
        break; // overview has no state
      case 3:
        selectedOption = (prevCardState as SecureLoginMethodState)
          .selectedOption!;
        break;
      case 4:
        password = (prevCardState as SecureLoginSetupState).password;
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
    if ((step === 0 || step === 4) && role === Role.owner) {
      step += 2;
    } else {
      step++;
    }
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
    const { role, goToLogin } = { ...this.props };
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
      duplicateEmail,
    } = {
      ...this.state,
    };
    const { appSettings } = { ...this.props };
    let section = <Fragment />;
    switch (step) {
      case 0:
        section = (
          <EmailCard
            role={role}
            errorMessage={errorMessage}
            duplicateEmail={duplicateEmail}
            email={email}
            fullname={fullname}
            goBack={this.goBack}
            goForward={this.goForward}
            goToLogin={goToLogin}
          />
        );
        break;
      case 1:
        if (isAnimatingForward) {
          section = (
            <Fragment>
              <EmailCard
                role={role}
                errorMessage={errorMessage}
                duplicateEmail={duplicateEmail}
                email={email}
                fullname={fullname}
                goBack={this.goBack}
                goForward={this.goForward}
                goToLogin={goToLogin}
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
              <EmailCard
                role={role}
                position="left"
                errorMessage={errorMessage}
                duplicateEmail={duplicateEmail}
                email={email}
                fullname={fullname}
                goBack={this.goBack}
                goForward={this.goForward}
                goToLogin={goToLogin}
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
          let prevCard = (
            <HelperProfile
              email={email}
              fullname={fullname}
              previewURL={previewURL}
              file={file}
              goBack={this.goBack}
              goForward={this.goForward}
            />
          );
          let card = (
            <HelperOverview
              goBack={this.goBack}
              goForward={this.goForward}
              position="right"
            />
          );
          if (role === Role.owner) {
            prevCard = (
              <EmailCard
                role={role}
                errorMessage={errorMessage}
                duplicateEmail={duplicateEmail}
                email={email}
                fullname={fullname}
                goBack={this.goBack}
                goForward={this.goForward}
                goToLogin={goToLogin}
              />
            );
            card = (
              <OwnerOverview
                goBack={this.goBack}
                goForward={this.goForward}
                position="right"
              />
            );
          }
          section = (
            <Fragment>
              {prevCard}
              {card}
            </Fragment>
          );
        } else if (isAnimatingBackward) {
          let card = (
            <HelperProfile
              email={email}
              fullname={fullname}
              previewURL={previewURL}
              file={file}
              goBack={this.goBack}
              goForward={this.goForward}
              position="left"
            />
          );
          let prevCard = (
            <HelperOverview goBack={this.goBack} goForward={this.goForward} />
          );
          if (role === Role.owner) {
            card = (
              <EmailCard
                role={role}
                errorMessage={errorMessage}
                duplicateEmail={duplicateEmail}
                email={email}
                fullname={fullname}
                goBack={this.goBack}
                goForward={this.goForward}
                position="left"
                goToLogin={goToLogin}
              />
            );
            prevCard = (
              <OwnerOverview goBack={this.goBack} goForward={this.goForward} />
            );
          }
          section = (
            <Fragment>
              {card}
              {prevCard}
            </Fragment>
          );
        } else {
          section =
            role === Role.owner ? (
              <OwnerOverview goBack={this.goBack} goForward={this.goForward} />
            ) : (
              <HelperOverview goBack={this.goBack} goForward={this.goForward} />
            );
        }
        break;
      case 3:
        if (isAnimatingForward) {
          let prevCard = (
            <HelperOverview goBack={this.goBack} goForward={this.goForward} />
          );
          let card = (
            <SecureLoginMethod
              role={role}
              goBack={this.goBack}
              goForward={this.goForward}
              position="right"
            />
          );
          if (role === Role.owner) {
            prevCard = (
              <OwnerOverview goBack={this.goBack} goForward={this.goForward} />
            );
            card = (
              <SecureLoginMethod
                role={role}
                goBack={this.goBack}
                goForward={this.goForward}
                position="right"
              />
            );
          }
          section = (
            <Fragment>
              {prevCard}
              {card}
            </Fragment>
          );
        } else if (isAnimatingBackward) {
          let card = (
            <HelperOverview
              goBack={this.goBack}
              goForward={this.goForward}
              position="left"
            />
          );
          if (role === Role.owner) {
            card = (
              <OwnerOverview
                goBack={this.goBack}
                goForward={this.goForward}
                position="left"
              />
            );
          }
          section = (
            <Fragment>
              {card}
              (
              <SecureLoginMethod
                role={role}
                goBack={this.goBack}
                goForward={this.goForward}
              />
              )
            </Fragment>
          );
        } else {
          section = (
            <SecureLoginMethod
              role={role}
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
              <SecureLoginMethod
                role={role}
                goBack={this.goBack}
                goForward={this.goForward}
              />
              <SecureLoginSetup
                role={role}
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
              <SecureLoginMethod
                role={role}
                goBack={this.goBack}
                goForward={this.goForward}
                position="left"
              />
              <SecureLoginSetup
                role={role}
                password={password}
                selectedOption={selectedOption}
                goBack={this.goBack}
                goForward={this.goForward}
              />
            </Fragment>
          );
        } else {
          section = (
            <SecureLoginSetup
              role={role}
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
              <SecureLoginSetup
                role={role}
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
              <SecureLoginSetup
                role={role}
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
          let prevCard = (
            <NotarySetup
              notaryId={notaryId}
              notaryState={notaryState}
              goBack={this.goBack}
              goForward={this.goForward}
            />
          );
          if (role === Role.owner) {
            prevCard = (
              <SecureLoginSetup
                role={role}
                password={password}
                selectedOption={selectedOption}
                goBack={this.goBack}
                goForward={this.goForward}
              />
            );
          }
          section = (
            <Fragment>
              {prevCard}
              <RegisterAndLogin appSettings={appSettings} position="right" />
            </Fragment>
          );
        } else {
          section = <RegisterAndLogin appSettings={appSettings} />;
        }
        break;
      default:
        break;
    }
    return <section className="helper-register container">{section}</section>;
  }
}
