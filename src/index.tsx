import React from 'react';
import { render } from 'react-dom';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import './app.global.css';

const store = configureStore();

// ipcRenderer.on('open-file', (_, path) => {
//   if (path && fs.existsSync(path)) {
//     if (store.getState().editor.avro.isPristine) {
//       const avro = fs.readFileSync(path, 'utf8');
//       changeAvroWithDispatch(avro)(store.dispatch);
//       changeAvroPathWithDispatch(path)(store.dispatch);
//     } else {
//       message.error('You currently have an opened file with changes.');
//     }
//   }
// });

// ipcRenderer.on('message', (_, text) => {
//   message.info(text);
// });

// document.addEventListener('DOMContentLoaded', () =>
render(
  <Root store={store} history={history} />,
  document.getElementById('root')
);
