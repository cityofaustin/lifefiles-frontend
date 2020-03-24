import React, {ChangeEvent, Component, FormEvent} from 'react';
import {Button} from 'reactstrap';
import './SearchInput.scss';

interface SearchInputProps {
  handleSearch: (query: string) => void;
}

interface SearchInputState {
  query: string;
}

class SearchInput extends Component<SearchInputProps, SearchInputState> {

  constructor(props: Readonly<SearchInputProps>) {
    super(props);
    this.state = {
      query: ''
    };
  }

  handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const {handleSearch} = {...this.props};
    const {query} = {...this.state};

    handleSearch(query);
  };

  handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;
    const key = e.target.name;

    if (Object.keys(this.state).includes(key)) {
      this.setState({[key]: value} as Pick<SearchInputState, keyof SearchInputState>);
    }
  };

  render() {
    const {query} = {...this.state};
    const {handleSearch} = {...this.props};

    return (
      <form onSubmit={this.handleSearch} style={{width: '100%', display: 'flex'}}>
        <input className="search searchbar" type="search"
               name="query"
               value={query} onChange={this.handleInputChange}
               placeholder="Search..."/>
        <Button color="primary" type="submit" className="search-btn" style={{minWidth: '132px', height: '56px'}}>Search</Button>
        <svg className="icon-search" width="31.333" height="31.333" viewBox="0 0 31.333 31.333">
          <g id="magnifying-glass" data-name="magnifying-glass" opacity="0.2">
            <path id="Path_18" data-name="Path 18" d="M41.95,40.108l-7.533-7.533a13.194,13.194,0,1,0-1.848,1.848L40.1,41.95a1.3,1.3,0,0,0,1.848-1.842ZM24.2,34.781A10.58,10.58,0,1,1,34.788,24.2,10.59,10.59,0,0,1,24.2,34.781Z" transform="translate(-11 -11)"/>
          </g>
        </svg>
        {/*      <svg className="icon-search"*/}
  {/*           aria-hidden="true" width="18"*/}
  {/*           height="18" viewBox="0 0 18 18">*/}
  {/*        <path*/}
  {/*d="M18 16.5l-5.14-5.18h-.35a7 7 0 1 0-1.19 1.19v.35L16.5 18l1.5-1.5zM12 7A5 5 0 1 1 2 7a5 5 0 0 1 10 0z"/>*/}
  {/*      </svg>*/}
      </form>

    );
  }
}

export default SearchInput;
