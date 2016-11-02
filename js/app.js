const getRepoInfo = function(repo) {
  return fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}`, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
  }).then(function (response) {
    return response.json();
  }).then(function (data) {
    data.tags = repo.tags;
    return data;
  }).catch(function(error) {
    console.log(error);
  });
};

ReactDOM.render(
  <UIRepository />,
  document.getElementById('app')
);