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
import './HelperRegister.scss';
import CryptoUtil from '../../../util/CryptoUtil';

interface HelperRegisterState {
  email: string;
  fullname: string;
  step: number;
  previewURL?: string;
  selectedOption?: LoginOption;
  password: string;
  errorMessage: string;
  notaryName: string;
  notaryId: string;
  notaryState: string;
}
interface HelperRegisterProps {
  handleLogin: (loginResponse: any) => Promise<void>;
  goBack: () => void;
}
export default class HelperRegister extends Component<
  HelperRegisterProps,
  HelperRegisterState
> {
  state = {
    email: '',
    fullname: '',
    // step: 0,
    step: 5,
    previewURL: '',
    // selectedOption: undefined as any,
    selectedOption: LoginOption.PrivateKey as any,
    password: '',
    errorMessage: '',
    notaryName: '',
    notaryId: '',
    notaryState: '',
  };

  handleRegister = async () => {
    const {
      email,
      password,
      selectedOption,
      notaryName,
      notaryId,
      notaryState,
    } = { ...this.state };
    // const { fullname, previewURL } = { ...this.state };
    // notary things
    let { errorMessage } = { ...this.state };
    const username = this.state.email.split('@')[0];
    const accountBody = { email, password, username };
    let secureAccountbody;
    if (selectedOption === LoginOption.PrivateKey) {
      window.sessionStorage.setItem('bring-your-own-key', password);
      const publicKey = CryptoUtil.getPublicKeyByPrivateKey('0x' + password);
      const address = CryptoUtil.getAddressByPublicKey(publicKey);

      secureAccountbody = {
        email,
        password: 'isnotused',
        username: address,
        publicEncryptionKey: publicKey,
      };
    }

    try {
      let registerResponse;
      if (selectedOption === LoginOption.PrivateKey) {
        registerResponse = await AccountService.registerHelperAccount({
          account: secureAccountbody,
        });
      } else {
        registerResponse = await AccountService.registerHelperAccount({
          account: accountBody,
        });
      }

      if (registerResponse === undefined) {
        throw new Error('Server unavailable.');
      }

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
    this.setState({ errorMessage, step: 0 });
  };

  goBack = () => {
    let { step } = { ...this.state };
    const { goBack } = { ...this.props };
    if (step === 0) {
      goBack();
      return;
    }
    step--;
    this.setState({ step });
  };

  goForward = (prevCardState?: any) => {
    let {
      step,
      email,
      fullname,
      previewURL,
      selectedOption,
      password,
      notaryName,
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
          ({ notaryName, notaryId, notaryState } = {
            ...(prevCardState as NotarySetupState),
          });
        }
        break;
    }
    step++;
    this.setState(
      {
        step,
        email,
        fullname,
        previewURL,
        selectedOption,
        password,
        notaryName,
        notaryId,
        notaryState,
      },
      () => {
        if (this.state.step === 6) {
          this.handleRegister();
        }
      }
    );
  };

  render() {
    const {
      email,
      fullname,
      previewURL,
      step,
      selectedOption,
      password,
      errorMessage,
    } = {
      ...this.state,
    };
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
        section = (
          <HelperProfile
            previewURL={previewURL}
            goBack={this.goBack}
            goForward={this.goForward}
          />
        );
        break;
      case 2:
        section = (
          <HelperOverview goBack={this.goBack} goForward={this.goForward} />
        );
        break;
      case 3:
        section = (
          <HelperLoginMethod goBack={this.goBack} goForward={this.goForward} />
        );
        break;
      case 4:
        section = (
          <HelperLoginSetup
            password={password}
            selectedOption={selectedOption}
            goBack={this.goBack}
            goForward={this.goForward}
          />
        );
        break;
      case 5:
        section = (
          <NotarySetup goBack={this.goBack} goForward={this.goForward} />
        );
        break;
      default:
        break;
    }
    return section;
  }
}
