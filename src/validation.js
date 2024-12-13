import * as yup from 'yup';

const createValidationSchema = (existingFeeds) => 
  yup.string()
    .required('Ссылка обязательна для заполнения')
    .url('Некорректный формат URL')
    .notOneOf(existingFeeds, 'RSS уже добавлен');

export default createValidationSchema;
