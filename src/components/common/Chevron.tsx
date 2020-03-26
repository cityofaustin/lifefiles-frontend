import React, {Component, Fragment} from 'react';

interface ChevronProps { isAscending: boolean; onClick: () => void; }

class Chevron extends Component<ChevronProps> {

  static defaultProps = {
    isAscending: true,
    onClick: () => {}
  };

  constructor(props: Readonly<ChevronProps>) {
    super(props);
  }

  render() {
    const {isAscending, onClick} = {...this.props};
    return (
      <div style={{display: 'flex', marginTop: '27px', alignItems: 'center', cursor: 'pointer'}} onClick={onClick}>
        {isAscending && (
          <svg width="18.753" height="11.498" viewBox="0 0 18.753 11.498" style={{transform: 'rotate(180deg)'}}>
            <g transform="translate(-372.379 -234.379) ">
              <line x1="7.255" y2="7.255" transform="translate(381.755 236.5)" fill="none" stroke="#90afe2" strokeLinecap="round" strokeWidth="3"/>
              <line x2="7.255" y2="7.255" transform="translate(374.5 236.5)" fill="none" stroke="#90afe2" strokeLinecap="round" strokeWidth="3"/>
            </g>
          </svg>
        )}
        {!isAscending && (
          <svg width="18.753" height="11.498" viewBox="0 0 18.753 11.498">
            <g transform="translate(-372.379 -234.379)">
              <line x1="7.255" y2="7.255" transform="translate(381.755 236.5)" fill="none" stroke="#90afe2" strokeLinecap="round" strokeWidth="3"/>
              <line x2="7.255" y2="7.255" transform="translate(374.5 236.5)" fill="none" stroke="#90afe2" strokeLinecap="round" strokeWidth="3"/>
            </g>
          </svg>
        )}
      </div>
    );
  }
}

export default Chevron;
