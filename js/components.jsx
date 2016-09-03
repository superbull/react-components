class RepositoryList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      repos: Immutable.fromJS({}),
      search: '',
      filteredRepoIds: [],
    }

    this.handleSearch = this.handleSearch.bind(this)
  }

  componentDidMount() {
    fetch(`https://superbull.github.io/open-source-react-ui-components/components.json`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
    }).then(response => {
      return response.json()
    }).then(repos => {
      Promise.all(repos.map(getRepoInfo)).then(values => {
        this.setState(({repos}) => ({
          repos: repos.merge(Immutable.Map(values.map(value => [value.id, Immutable.fromJS(value)]))),
          search: '',
          filteredRepoIds: values.map(value => value.id),
        }))
      })
    }).catch(error => {
      console.log(error)
    })
  }

  handleSearch(e) {
    if (e.target.value == '') {
      this.setState(({repos}) => ({
        search: '',
        filteredRepoIds: repos.keySeq().toJS(),
      }))
    } else {
      const fuse = new Fuse(this.state.repos.toList().toJS(), {
        keys: ['full_name', 'description'],
        id: 'id',
      })
      this.setState({
        search: e.target.value,
        filteredRepoIds: fuse.search(e.target.value),
      })
    }
  }

  render() {
    const {
      search,
      repos,
      filteredRepoIds,
    } = this.state

    return (
      <div>
        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="container">
            <div className="navbar-header">
              <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <a className="navbar-brand" href="#">Open Source React UI Components</a>
            </div>
            <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
              <ul className="nav navbar-nav">
              </ul>
              <ul className="nav navbar-nav navbar-right">
              </ul>
            </div>
          </div>
        </nav>
        <div className="container">
          <form
            onSubmit={this.onSearch}
          >
            <div className="form-group">
              <input
                value={search}
                onChange={this.handleSearch}
                className="form-control input-lg"
                placeholder="Search UI components ..."
                type="search"
              />
            </div>
          </form>
          <ul className="list-group">
            {filteredRepoIds.map(id => (
              <li className="list-group-item">
                <span className="badge">
                  <span
                    className="glyphicon glyphicon-star"
                    aria-hidden="true"
                  /> {repos.getIn([id, 'stargazers_count'])}
                </span>
                <h4 className="list-group-item-heading">
                  <a href={repos.getIn([id, 'html_url'])}>{repos.getIn([id, 'full_name'])}</a>
                </h4>
                <p className="list-group-item-text">{repos.getIn([id, 'description'])}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }
}
