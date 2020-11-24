import React, { Component } from 'react';
import './Accordion.scss';
// import { ReactComponent as CheckboxAnimated } from "../../img/checkbox-animated.svg";
import { ReactComponent as ChevronRight } from '../../img/chevron-right2.svg';

interface AccordionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  isExpanded?: boolean;
  setExpanded?: (isChecked: boolean) => void;
  labelType?: string;
}

interface AccordionState {
  isExpanded: boolean;
}

export default class Accordion extends Component<
  AccordionProps,
  AccordionState
> {
  constructor(props) {
    super(props);

    this.state = {
      isExpanded: props.isExpanded ? true : false,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.isExpanded !== this.props.isExpanded) {
      this.setState({ isExpanded: !!this.props.isExpanded });
    }
  }

  expandCollapse = (e) => {
    const { setExpanded } = { ...this.props };
    this.setState({ isExpanded: e.target.checked });
    if (setExpanded) {
      setExpanded(e.target.checked);
    }
  };

  render() {
    const { id, title, icon, labelType } = { ...this.props };
    const { isExpanded } = { ...this.state };
    return (
      <div className="accordion">
        <div>
          <input
            className="accordion-input"
            type="checkbox"
            id={id}
            checked={isExpanded}
            onChange={this.expandCollapse}
          />
          <label
            className={
              'accordion-label ' + (labelType === 'loading' ? 'loading' : '')
            }
            htmlFor={id}
          >
            <div className="left-header">
              {icon}
              <span>{title}</span>
            </div>
            <ChevronRight />
          </label>
          <div className="accordion-content">{this.props.children}</div>
        </div>
      </div>
    );
  }
}
