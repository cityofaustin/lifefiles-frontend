import React, { Component, ReactNode } from 'react';
import Select from 'react-select';

interface SelectProps {
  value?: any;
  options: any[];
  onChange: (documentTypeOption: any) => void;
  isSearchable?: boolean;
  placeholder?: ReactNode;
  isSmall?: boolean;
  isDisabled?: boolean;
  noStyles?: boolean;
}

export default class MSelect extends Component<SelectProps> {
  render() {
    const {
      options,
      onChange,
      isSearchable,
      placeholder,
      isSmall,
      value,
      isDisabled,
      noStyles,
    } = { ...this.props };
    let styles: any = undefined;
    if (!noStyles) {
      styles = isSmall ? customStylesSm : customStyles;
    }
    return (
      <Select
        value={value}
        options={options}
        onChange={onChange}
        isSearchable={isSearchable}
        placeholder={placeholder}
        styles={styles}
        isDisabled={!!isDisabled}
      />
    );
  }
}

const customStyles = {
  control: (provided: any) => ({
    ...provided,
    height: '54.8px',
  }),
  option: (provided: any, state: any) => {
    // if(state.isSelected) {
    //   console.log(provided);
    // }
    const backgroundColor = state.isSelected
      ? '#2362C7'
      : provided.backgroundColor;
    const color = state.isSelected ? 'white' : '#3b3b3b';
    //   label: "option"
    //   backgroundColor: "#2684FF"
    //   color: "hsl(0, 0%, 100%)"
    //   cursor: "default"
    //   display: "block"
    //   fontSize: "inherit"
    //   padding: "8px 12px"
    //   width: "100%"
    //   userSelect: "none"
    //   WebkitTapHighlightColor: "rgba(0, 0, 0, 0)"
    // :active: {backgroundColor: "#2684FF"}
    //   boxSizing: "border-box"
    return {
      ...provided,
      backgroundColor,
      fontFamily: 'Montserrat, Arial, sans-serif',
      fontSize: '25px',
      color,
      paddingLeft: '27.5px',
      paddingTop: '7px',
      paddingBottom: '7px',
      opacity: state.isDisabled ? 0.5 : 1,
      // borderBottom: '1px dotted pink',
      // color: state.isSelected ? 'red' : 'blue',
      // padding: 20
    };
  },
  input: (provided: any) => ({
    ...provided,
  }),
  placeholder: (provided: any) => ({
    ...provided,
    fontFamily: 'Montserrat, Arial, sans-serif',
    fontSize: '25px',
    color: '#3b3b3b',
    paddingLeft: '30px',
    // marginTop: '12px',
    // marginBottom: '12px'
  }),
  singleValue: (provided: any, state: any) => ({
    ...provided,
    fontFamily: 'Montserrat, Arial, sans-serif',
    fontSize: '25px',
    color: '#3b3b3b',
    paddingLeft: '30px',
    opacity: state.isDisabled ? 0.5 : 1,
    transition: 'opacity 300ms',
  }),
};

const customStylesSm = {
  control: (provided: any) => ({
    ...provided,
    height: '54.8px',
  }),
  option: (provided: any, state: any) => {
    const backgroundColor = state.isSelected
      ? '#2362C7'
      : provided.backgroundColor;
    const color = state.isSelected ? 'white' : '#3b3b3b';
    return {
      ...provided,
      backgroundColor,
      fontFamily: 'Montserrat, Arial, sans-serif',
      fontSize: '18px',
      color,
      paddingLeft: '27.5px',
      paddingTop: '7px',
      paddingBottom: '7px',
      opacity: state.isDisabled ? 0.5 : 1,
    };
  },
  input: (provided: any) => ({
    ...provided,
  }),
  placeholder: (provided: any) => ({
    ...provided,
    fontFamily: 'Montserrat, Arial, sans-serif',
    fontSize: '18px',
    color: '#3b3b3b',
    paddingLeft: '30px',
  }),
  singleValue: (provided: any, state: any) => ({
    ...provided,
    fontFamily: 'Montserrat, Arial, sans-serif',
    fontSize: '18px',
    color: '#3b3b3b',
    paddingLeft: '30px',
    opacity: state.isDisabled ? 0.5 : 1,
    transition: 'opacity 300ms',
  }),
};
