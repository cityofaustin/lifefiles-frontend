import React, {ChangeEvent, Component, FormEvent, Fragment} from 'react';
import {Button} from 'reactstrap';
import './SearchInput.scss';
import {ReactComponent as MagnifyingGlass} from '../../img/magnifying-glass.svg';

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

  handleSearch = (e: FormEvent<HTMLFormElement> | any) => {
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
      <Fragment>
        <form onSubmit={this.handleSearch} className="search-container">
          <input className="search searchbar" type="search"
                 name="query"
                 value={query} onChange={this.handleInputChange}
                 placeholder="Search..."/>
          <Button color="primary" type="submit" className="search-btn" style={{minWidth: '132px', height: '56px'}}>Search</Button>
          <svg className="icon-search" width="31.333" height="31.333" viewBox="0 0 31.333 31.333">
            <g opacity="0.2">
              <path d="M41.95,40.108l-7.533-7.533a13.194,13.194,0,1,0-1.848,1.848L40.1,41.95a1.3,1.3,0,0,0,1.848-1.842ZM24.2,34.781A10.58,10.58,0,1,1,34.788,24.2,10.59,10.59,0,0,1,24.2,34.781Z" transform="translate(-11 -11)"/>
            </g>
          </svg>
        </form>
        <form onSubmit={this.handleSearch} className="search-container-sm">
          <input className="search searchbar" type="search"
                 name="query"
                 value={query} onChange={this.handleInputChange}
                 placeholder="Search..."/>
          <MagnifyingGlass onClick={this.handleSearch} />
        </form>
      </Fragment>
    );
  }
}

export default SearchInput;
