// import React, { Component } from 'react';
// import './Toggle.scss';
//
// interface ToggleProps {
//   onChange: (value: boolean) => void;
//   name: string;
//   defaultChecked?: boolean;
//   disabled?: boolean;
//   value: boolean;
// }
//
// class Toggle extends Component<ToggleProps> {
//
//   static defaultProps = {
//     defaultChecked: false,
//     disabled: false
//   };
//
//   componentDidMount() {
//     const { onChange, defaultChecked } = this.props;
//     onChange(defaultChecked);
//   }
//
//   render() {
//     const {
//       name, disabled, value, onChange
//     } = this.props;
//
//     return (
//       <div className="toggle-btn">
//         <input
//           className="toggle-btn__input"
//           type="checkbox"
//           name={name}
//           onChange={(e) => onChange}
//           checked={value}
//           disabled={disabled}
//         />
//         <button type="button"
//                 className="toggle-btn__input-label"
//                 onClick={() => onChange(!value)}
//         >
//           Toggle
//         </button>
//       </div>
//     );
//   }
// }
//
// interface ToggleButtonFieldProps {
//   input: ToggleButtonFieldInput;
//   defaultChecked?: boolean;
//   disabled?: boolean;
// }
//
// interface ToggleButtonFieldInput {
//   onChange: () => void;
//   name: string;
// }
//
// const renderToggleButtonField = (props: ToggleButtonFieldProps) => {
//   props.defaultChecked = props.defaultChecked ? props.defaultChecked : false;
//   props.disabled = props.disabled ? props.disabled : false;
//   const { input, defaultChecked, disabled } = props;
//   return (
//     <Toggle
//       {...input}
//       value={defaultChecked}
//       defaultChecked={defaultChecked}
//       disabled={disabled}
//     />
//   );
// };
//
// export default renderToggleButtonField;
