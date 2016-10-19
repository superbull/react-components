// react components

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

//=======================================================

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

//=======================================================

const SearchBar = (props) => (
  <form>
    <div className="form-group">
      <input
        value={props.searchText}
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

//=======================================================

const TagsBar = (props) => (
  <div className="tags-bar">
    {props.tags.map(tag => {
      const labelClass = 
        props.selectedTags.includes(tag) ? 
        'label label-success' :
        'label label-default'
      return (
        <span 
          className={labelClass}
          onClick={() => props.toggleTag(tag)}
        >
          {tag}
        </span>
      )
    })}
  </div>
)

//=======================================================

const SortBy = (props) => (
  <div className="sort-bar pull-right">
    Sort By:{' '}
    <div className="btn-group" role="group">
      <button
        type="button"
        className="btn btn-sm btn-default"
        disabled={props.sortBy == 'full_name'}
        onClick={() => props.onSortBy('full_name')}
      >
        Name
      </button>
      <button
        type="button"
        className="btn btn-sm btn-default"
        disabled={props.sortBy == 'stargazers_count'}
        onClick={() => props.onSortBy('stargazers_count')}
      >
        Star
      </button>
    </div>
  </div>
)

//=======================================================

const RepositoryList = (props) => (
  <ul className="list-group">
    {props.repos.map(repo => (
      <li className="list-group-item">
        <span className="badge">
          <span
            className="glyphicon glyphicon-star"
            aria-hidden="true"
          /> {repo.get('stargazers_count')}
        </span>
        <h4 className="list-group-item-heading">
          <a href={repo.get('html_url')}>{repo.get('full_name')}</a>
        </h4>
        <p className="list-group-item-text">{repo.get('description')}</p>
        <p className="list-group-item-text">
          {repo.get('tags').map(tag => (
            <span 
              className="label label-warning"
            >
              {tag}
            </span>
          ))}
        </p>
      </li>
    ))}
  </ul>
)

//=======================================================

class UIRepository extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      repos: Immutable.fromJS([]),
      search: '',
      isLoading: false,
      tags: Immutable.fromJS([]),
      selectedTags: Immutable.fromJS([]),
      sortBy: 'full_name',    // full_name, stargazers_count
    }

    this.handleSearch = this.handleSearch.bind(this)
    this.toggleTag = this.toggleTag.bind(this)
    this.getFilteredRepos = this.getFilteredRepos.bind(this)
    this.handleSortBy = this.handleSortBy.bind(this)
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
        tags: repos.reduce((pre, current) => pre.union(current.tags), Immutable.Set([]))
      })

      Promise.all(repos.map(getRepoInfo)).then(values => {
        this.setState(({repos}) => ({
          repos: Immutable.fromJS(values),
          search: '',
          isLoading: false,
        }))
      })
    }).catch(error => {
      console.log(error)
    })
  }

  handleSearch(searchText) {
    this.setState({
      search: searchText
    })
  }

  toggleTag(tag) {
    if (this.state.selectedTags.includes(tag)) {
      this.setState({
        selectedTags: this.state.selectedTags.filter(selectedTag => selectedTag != tag)
      })
    } else {
      this.setState({
        selectedTags: this.state.selectedTags.push(tag)
      })
    }
  }

  getFilteredRepos() {
    const {
      search,
      repos,
      selectedTags,
    } = this.state

    let filteredRepos = repos

    // filter by tags
    if (selectedTags.size != 0) {
      filteredRepos = filteredRepos.filter(repo => {
        const tags = repo.get('tags')
        return selectedTags.reduce((prev, current) => prev || tags.includes(current), false)
      })
    }

    // filter by search
    if (search != '') {
      const fuse = new Fuse(filteredRepos.toList().toJS(), {
        keys: ['full_name', 'description'],
      })
      filteredRepos = fuse.search(search)
    }

    return filteredRepos
  }

  handleSortBy(sortBy) {
    this.setState({
      sortBy: sortBy,
    })
  }

  render() {
    const {
      search,
      repos,
      isLoading,
      tags,
      selectedTags,
      sortBy,
    } = this.state

    const Loading = isLoading ? <LoadingSpinner /> : ''

    const filteredRepos = this.getFilteredRepos()
    const sortedRepos = sortBy == 'stargazers_count' ? 
      filteredRepos.sortBy(
        repo => repo.get('stargazers_count'),
        (a, b) => b - a
      ) :
      filteredRepos.sortBy(repo => repo.get('full_name').toLowerCase())

    return (
      <div>
        <NavBar />
        <div className="container">
          <SearchBar
            searchText={search}
            handleSearch={this.handleSearch}
          />
          <TagsBar 
            tags={tags.sortBy(tag => tag).toJS()}
            selectedTags={selectedTags.toJS()}
            toggleTag={this.toggleTag}
          />
          <div className="panel panel-default">
            <div className="panel-heading clearfix">
              <SortBy
                sortBy={sortBy}
                onSortBy={this.handleSortBy}
              />
            </div>
            {Loading}
            <RepositoryList
              repos={sortedRepos}
            />
          </div>
        </div>
      </div>
    )
  }
}
