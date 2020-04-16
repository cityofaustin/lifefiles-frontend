import React, {Component, Fragment} from 'react';

interface SortArrowProps {
  isAscending: boolean;
  onClick: () => void;
}

class SortArrow extends Component<SortArrowProps> {
  static defaultProps = {
    isAscending: true,
    onClick: () => {
    }
  };

  render() {
    const {isAscending, onClick} = {...this.props};
    return (
      <div onClick={onClick} style={{display: 'flex', alignItems: 'center'}}>
        {isAscending && (
          <svg width="10.828" height="15.414">
            <g transform="rotate(180, 5.414, 7.707)">
              <line
                y2="13"
                transform="translate(4)"
                fill="none"
                stroke="#90afe2"
                strokeLinecap="round"
                strokeWidth="2"
              />
              <line
                x1="4"
                y1="4"
                transform="translate(0 9)"
                fill="none"
                stroke="#90afe2"
                strokeLinecap="round"
                strokeWidth="2"
              />
              <line
                y1="4"
                x2="4"
                transform="translate(4 9)"
                fill="none"
                stroke="#90afe2"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </g>
          </svg>
        )}
        {!isAscending && (
          <svg width="10.828" height="15.414">
            <g>
              <line
                y2="13"
                transform="translate(4)"
                fill="none"
                stroke="#90afe2"
                strokeLinecap="round"
                strokeWidth="2"
              />
              <line
                x1="4"
                y1="4"
                transform="translate(0 9)"
                fill="none"
                stroke="#90afe2"
                strokeLinecap="round"
                strokeWidth="2"
              />
              <line
                y1="4"
                x2="4"
                transform="translate(4 9)"
                fill="none"
                stroke="#90afe2"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </g>
          </svg>
        )}
      </div>
    );
  }
}

export default SortArrow;
