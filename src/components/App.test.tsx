import {shallow} from 'enzyme';
import * as React from 'react';
import App from './App';

describe('<App />', () => {
  it('renders', () => {
    let newValue = false;
    const props = { className: 'test', value: true, onSelectChanged: (value: boolean) => { newValue = value; } };
    const wrapper = shallow(<App {...props} />);
    const div = wrapper.find('div');
    expect(div).toBeTruthy();
    // expect(div).toEqual('hello');

    // sut.find('select').simulate('change', {target: { value : 'true'}});
    // expect(newValue).toEqual(true);
    // sut.find('select').simulate('change', {target: { value : 'false'}});
    // expect(newValue).toEqual(false);
  });
});
