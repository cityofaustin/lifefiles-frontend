import { shallow } from 'enzyme';
import * as React from 'react';
import Role from '../../models/Role';
import MainContainer from './MainContainer';

describe('<MainContainer />', () => {
  it('renders', () => {
    const props = {
      appSettings: [],
      saveAppSettings: async (title, logo?) => {},
      account,
      handleLogout: () => {},
      updateAccountShareRequests: () => {},
      // privateEncryptionKey?: u=;
      setBringYourOwnEncryptionKey: () => {},
      coreFeatures: [],
      viewFeatures: [],
    };
    const wrapper = shallow(<MainContainer {...props} />);
    const div = wrapper.find('div');
    expect(div).toBeTruthy();
  });
});

const account = {
  username: '',
  firstName: '-',
  lastName: '-',
  id: '',
  email: '',
  role: Role.owner,
  didAddress: '',
  didPublicEncryptionKey: '',
  token: '',
  shareRequests: [],
  canAddOtherAccounts: false,
  documents: []
};
