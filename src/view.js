import onChange from 'on-change';

export default (elements, i18n, state) => {
  const { t } = i18n;

  const renderForm = () => {
    const { input } = elements;
    input.focus();
    Object.entries(elements.staticEl).forEach(([key, el]) => {
      const element = el;
      element.textContent = t(`${key}`);
    });
  };
  
  const createCard = (title, description) => `
  <li class="list-group-item border-0 border-end-0">
    <h3 class="h6 m-0">${title}</h3>
    <p class="m-0 small text-black-50">${description}</p>
  </li>`;
  
  const createPostCard = (title, id, url, isRead) => `
  <li class="list-group-item border-0 border-end-0 d-flex justify-content-between align-items-start">
    <a href="${url}" id="${id}" target="_blank" class="${isRead ? 'fw-normal link-secondary' : 'fw-bold'}">
      ${title}
    </a>
    <button type="button" class="btn btn-outline-primary btn-sm" data-id="${id}" data-bs-toggle="modal" data-bs-target="#modal">
      ${t('postsButton')}
    </button>
  </li>`;

  const renderBlock = (title) => {
    const card = document.createElement('div');
    const cardBody = document.createElement('div');
    const cardTitle = document.createElement('h2');

    card.classList.add('card', 'border-0');
    cardBody.classList.add('card-body');
    cardTitle.classList.add('card-title', 'h4');
    cardTitle.textContent = title;

    card.append(cardBody);
    cardBody.append(cardTitle);
    return card;
  };

  const renderFeeds = () => {
  const feedContainer = document.querySelector('.feeds');
  feedContainer.innerHTML = '';
  const block = renderBlock(t('feedTitle'));
  const lists = document.createElement('ul');
  lists.classList.add('list-group', 'border-0', 'rounded-0');

  state.feeds.forEach(({ title, description }) => {
    lists.insertAdjacentHTML('beforeend', createCard(title, description));
  });

  feedContainer.append(block, lists);
};

  const renderPosts = () => {
  const postsContainer = document.querySelector('.posts');
  postsContainer.innerHTML = '';
  const postBlock = renderBlock(t('postsTitle'));
  const lists = document.createElement('ul');
  lists.classList.add('list-group', 'border-0', 'rounded-0');

  state.posts.forEach(({ title, id, url }) => {
    const isRead = state.ui.touchedPostId.includes(id);
    lists.insertAdjacentHTML('beforeend', createPostCard(title, id, url, isRead));
  });

  postsContainer.append(postBlock, lists);
};

  const renderModal = () => {
    const activePost = state.posts.find(({ id }) => id === state.ui.activePostId);
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    const readMore = document.querySelector('.read-more');
    const modalBtn = document.querySelector('.btn-secondary');

    const { title, description, url } = activePost;
    modalTitle.textContent = title;
    modalBody.textContent = description;
    readMore.textContent = t('modal.readMore');
    modalBtn.textContent = t('modal.close');
    readMore.href = url;
  };

  const renderFinishedProcess = () => {
    const { input, errorElement } = elements;
    input.classList.remove('is-invalid');
    errorElement.classList.remove('text-danger');
    errorElement.textContent = t('feedback');
    errorElement.classList.add('text-success');
  };

  const watchedState = onChange(state, (path, value, previousValue) => {
    const {
      errorElement, input, form,
    } = elements;
    switch (path) {
      case 'form.errors':
        errorElement.classList.remove('text-success');
        errorElement.classList.add('text-danger');
        input.classList.add('is-invalid');
        errorElement.textContent = t(state.form.errors);
        input.focus();
        break;
      case 'loadingProcess.status':
        if (value === 'sending') {
          errorElement.textContent = '';
        } else if (value === 'finished') {
          renderFinishedProcess();
          form.reset();
          input.focus();
          renderFeeds();
          renderPosts();
        }
        break;
      case 'posts':
        if (value.length !== previousValue.length) {
          renderPosts();
        }
        break;
      case 'feeds':
        if (value) {
          renderFeeds();
          form.reset();
          input.focus();
        }
        break;
      case 'ui.touchedPostId':
        state.ui.touchedPostId.forEach((postId) => {
          const post = document.getElementById(postId);
          if (!post.classList.contains('fw-normal')) {
            post.classList.remove('fw-bold');
            post.classList.add('fw-normal', 'link-secondary');
          }
        });
        break;
      case 'ui.activePostId':
        renderModal();
        break;
      default:
        break;
    }
  });
  return {
    watchedState,
    renderForm,
  };
};
