import myRequest from './index';

export function getSearchHot() {
  return myRequest.get('/search/hot');
}

export function getSearchSuggest(keywords) {
  return myRequest.get('/search/suggest', { keywords, type: 'mobile' });
}
