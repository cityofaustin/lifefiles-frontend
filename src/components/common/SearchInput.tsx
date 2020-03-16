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
        <Button color="primary" type="submit">Search</Button>
        <svg className="icon-search"
             aria-hidden="true" width="18"
             height="18" viewBox="0 0 18 18">
          <path
  d="M18 16.5l-5.14-5.18h-.35a7 7 0 1 0-1.19 1.19v.35L16.5 18l1.5-1.5zM12 7A5 5 0 1 1 2 7a5 5 0 0 1 10 0z"/>
        </svg>
      </form>

    );
  }
}

export default SearchInput;
