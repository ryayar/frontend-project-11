import i18next from 'i18next';
import 'bootstrap';
import axios from 'axios';
import _ from 'lodash';
import validate, { createLink } from '../utils.js';
import watch from './view.js';
import ru from './locales/ru.js';
import en from './locales/en.js';
import parse from './parser.js';

const elements = {
  staticEl: {
    title: document.querySelector('h1'),
    linkExample: document.querySelector('.link-example'),
    subtitle: document.querySelector('.lead'),
    label: document.querySelector('[for="url-input"]'),
    button: document.querySelector('[type="submit"]'),
    close: document.querySelector('.btn-secondary'),
    createdBy: document.querySelector('.created-by'),
    createdByLink: document.querySelector('.created-by-link'),
  },
  form: document.querySelector('form'),
  input: document.getElementById('url-input'),
  errorElement: document.querySelector('.feedback'),
  postsContainer: document.querySelector('.posts'),
};

const state = {
  form: {
    status: 'pending',
    errors: '',
  },
  loadingProcess: {
    status: 'sending',
    error: '',
  },
  posts: [],
  feeds: [],
  ui: {
    activePostId: '',
    touchedPostId: [],
  },
};

const timeout = 50000;

const getErrorMessage = (error) => {
  if (error.isAxiosError) return 'errors.networkError';
  if (error.message === 'errors.invalidRSS') return 'errors.invalidRSS';
  if (error.message === 'errors.existsRss') return 'errors.existsRss';
  if (error.message === 'errors.invalidUrl') return 'errors.invalidUrl';
  return 'errors.unknownError';
};

export default () => {
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: true,
    resources: { ru, en },
  }).then(() => {
    const { watchedState, renderForm } = watch(elements, i18n, state);

    renderForm();

    const getUpdateContent = (feeds) => {
      const promises = feeds.map(({ url }) => axios.get(createLink(url))
        .then((res) => {
          const parseData = parse(res.data.contents);
          const { posts } = parseData;
          const existPosts = watchedState.posts.map((post) => post.url);
          const newPosts = posts.filter((post) => !existPosts.includes(post.url));
          const updatePosts = newPosts.map((post) => ({ ...post, id: _.uniqueId() }));
          watchedState.posts = [...updatePosts, ...watchedState.posts];
        })
        .catch((e) => {
          throw e;
        }));

      Promise.all(promises)
        .finally(() => {
          setTimeout(() => getUpdateContent(watchedState.feeds), timeout);
        });
    };

    getUpdateContent(watchedState.feeds);

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const urlTarget = formData.get('url').trim();
      const urlFeeds = watchedState.feeds.map(({ url }) => url);

      watchedState.loadingProcess.status = 'sending';

      validate(urlTarget, urlFeeds)
        .then(({ url }) => {
          return axios.get(createLink(url));
        })
        .then((res) => {
          const parseData = parse(res.data.contents);
          const { feed, posts } = parseData;
          watchedState.feeds.push({ ...feed, feedId: _.uniqueId(), url: urlTarget });
          posts.forEach((post) => watchedState.posts.push({ ...post, id: _.uniqueId() }));
          watchedState.loadingProcess.status = 'finished';
          watchedState.loadingProcess.error = '';
        })
        .catch((error) => {
          watchedState.form.errors = getErrorMessage(error);
        });
    });

    elements.postsContainer.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        watchedState.ui.touchedPostId.push(e.target.id);
      }
      if (e.target.tagName === 'BUTTON') {
        watchedState.ui.touchedPostId.push(e.target.dataset.id);
        watchedState.ui.activePostId = e.target.dataset.id;
      }
    });
  });
};
