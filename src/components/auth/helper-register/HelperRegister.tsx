import React, { Component, Fragment } from 'react';
import HelperEmail, { HelperEmailState } from './HelperEmail';
import HelperProfile, { HelperProfileState } from './HelperProfile';
import HelperOverview from './HelperOverview';
import HelperLoginMethod, { HelperLoginMethodState } from './HelperLoginMethod';
import HelperLoginSetup from './HelperLoginSetup';
import './HelperRegister.scss';
import { LoginOption } from '../../svg/HelperLoginOption';

interface HelperRegisterState {
  email: string;
  fullname: string;
  step: number;
  previewURL?: string;
  selectedOption?: LoginOption;
}
interface HelperRegisterProps {
  goBack: () => void;
}
export default class HelperRegister extends Component<
  HelperRegisterProps,
  HelperRegisterState
> {
  state = {
    email: '',
    fullname: '',
    step: 3,
    previewURL: '',
    selectedOption: undefined as any,
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
    let { step, email, fullname, previewURL, selectedOption } = {
      ...this.state,
    };
    switch (step) {
      case 0:
        ({ email, fullname } = { ...(prevCardState as HelperEmailState) });
        break;
      case 1: // overview has no state
        break;
      case 2:
        previewURL = (prevCardState as HelperProfileState).previewURL!;
        break;
      case 3:
        selectedOption = (prevCardState as HelperLoginMethodState)
          .selectedOption!;
        break;
    }
    step++;
    this.setState({ step, email, fullname, previewURL, selectedOption });
  };
  render() {
    const { email, fullname, previewURL, step } = { ...this.state };
    let section = <Fragment />;
    switch (step) {
      case 0:
        section = (
          <HelperEmail
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
          <HelperLoginSetup goBack={this.goBack} goForward={this.goForward} />
        );
        break;
      default:
        break;
    }
    return section;
  }
}
