import 'bootstrap/dist/css/bootstrap.min.css';
import createValidationSchema from './validation.js';
import state from './state.js';
import onChange from 'on-change';

// Получаем элементы формы
const form = document.querySelector('#rss-form');
const input = document.querySelector('#rss-url');
const feedback = document.querySelector('.invalid-feedback');

// Реактивное обновление состояния
const watchedState = onChange(state, (path, value) => {
  if (path === 'form.valid') {
    if (value) {
      input.classList.remove('is-invalid');
      feedback.textContent = '';
    } else {
      input.classList.add('is-invalid');
      feedback.textContent = state.form.error;
    }
  }
});

// Логика обработки формы
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const url = input.value.trim();
  const schema = createValidationSchema(state.feeds);

  schema
    .validate(url)
    .then(() => {
      watchedState.form.valid = true;
      watchedState.form.error = null;

      // Добавляем URL в список фидов
      watchedState.feeds.push(url);

      // Сбрасываем форму
      input.value = '';
      input.focus();
    })
    .catch((err) => {
      watchedState.form.valid = false;
      watchedState.form.error = err.message;
    });
});
