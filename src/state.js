import onChange from 'on-change';

const initState = {
  form: {
    valid: true,
    error: null,
  },
  feeds: [],
};

const state = onChange(initState, (path, value) => {
  console.log(`Path changed: ${path}`, value);
});

export default state;
