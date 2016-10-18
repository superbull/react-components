class LoadingSpinner extends React.Component {
  render() {
    const { opts } = this.props
    return (
      <div style={{
        padding: '20px 0',
      }}>
        <div ref={(spinner) => {
          new Spinner(opts).spin(spinner)
        }} />
      </div>
    )
  }
}

LoadingSpinner.propTypes = {
  opts: React.PropTypes.object,
}

LoadingSpinner.defaultProps = {
  opts: {
    color:'#666',
    opacity: 0.25,
    lines: 12, 
    length: 25, 
    width: 12,
    radius: 30,
    scale: 0.2,
    position: 'relative',
    className: 'spinner',
  },
}


const NavBar = (props) => (
  <nav className="navbar navbar-default navbar-fixed-top">
    <div className="container">
      <div className="navbar-header">
        <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
          <span className="sr-only">Toggle navigation</span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
        </button>
        <a className="navbar-brand" href="#">React Components</a>
      </div>
      <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
        <ul className="nav navbar-nav">
        </ul>
        <ul className="nav navbar-nav navbar-right">
        </ul>
      </div>
    </div>
  </nav>
)


const SearchBar = (props) => (
  <form>
    <div className="form-group">
      <input
        onChange={(e) => {
          props.handleSearch(e.target.value)
        }}
        className="form-control input-lg"
        placeholder="Search UI components ..."
        type="search"
      />
    </div>
  </form>
)


const TagsBar = (props) => (
  <div>
    {props.tags.map(tag => (
      <span 
        className="label label-default"
        onClick={() => props.toggleTag(tag)}
      >
        {tag}
      </span>
    ))}
  </div>
)

const RepositoryList = (props) => (
  <ul className="list-group">
    {props.filteredRepoIds.map(id => (
      <li className="list-group-item">
        <span className="badge">
          <span
            className="glyphicon glyphicon-star"
            aria-hidden="true"
          /> {props.repos.getIn([id, 'stargazers_count'])}
        </span>
        <h4 className="list-group-item-heading">
          <a href={props.repos.getIn([id, 'html_url'])}>{props.repos.getIn([id, 'full_name'])}</a>
        </h4>
        <p className="list-group-item-text">{props.repos.getIn([id, 'description'])}</p>
      </li>
    ))}
  </ul>
)


class UIRepository extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      repos: Immutable.fromJS({}),
      search: '',
      filteredRepoIds: [],
      isLoading: false,
      tags: Immutable.fromJS([]),
      selectedTags: Immutable.fromJS([]),
    }

    this.handleSearch = this.handleSearch.bind(this)
    this.toggleTag = this.toggleTag.bind(this)
  }

  componentDidMount() {
    this.setState(({repos}) => ({
      isLoading: true,
    }))

    fetch(`https://raw.githubusercontent.com/superbull/react-components/master/components.json`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
    }).then(response => {
      return response.json()
    }).then(repos => {
      this.setState({
        tags: repos.reduce((pre, current) => pre.merge(current.tags), Immutable.fromJS([]))
      })

      Promise.all(repos.map(getRepoInfo)).then(values => {
        this.setState(({repos}) => ({
          repos: repos.merge(Immutable.Map(values.map(value => [value.id, Immutable.fromJS(value)]))),
          search: '',
          filteredRepoIds: values.map(value => value.id),
          isLoading: false,
        }))
      })
    }).catch(error => {
      console.log(error)
    })
  }

  handleSearch(searchText) {
    if (searchText == '') {
      this.setState(({repos}) => ({
        filteredRepoIds: repos.keySeq().toJS(),
      }))
    } else {
      const fuse = new Fuse(this.state.repos.toList().toJS(), {
        keys: ['full_name', 'description'],
        id: 'id',
      })
      this.setState({
        filteredRepoIds: fuse.search(searchText),
      })
    }
  }

  toggleTag(tag) {
    if (this.state.selectedTags.includes(tag)) {
      console.log('include')
    } else {
      console.log('not include')
    }
  }

  render() {
    const {
      search,
      repos,
      filteredRepoIds,
      isLoading,
      tags,
    } = this.state

    const Loading = isLoading ? <LoadingSpinner /> : ''

    return (
      <div>
        <NavBar />
        <div className="container">
          <SearchBar handleSearch={this.handleSearch} />
          <TagsBar 
            tags={tags.toJS()}
            toggleTag={this.toggleTag}
          />
          {Loading}
          <RepositoryList
            filteredRepoIds={filteredRepoIds}
            repos={repos}
          />
        </div>
      </div>
    )
  }
}
