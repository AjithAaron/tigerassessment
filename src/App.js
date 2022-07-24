import React from 'react';
import { Provider } from 'react-redux';

import UploadComponent from './components/UploadComponent';
import store from './Redux/store';
import 'antd/dist/antd.min.css';

function App() {
  return (<React.Fragment>
    <Provider store={store}>
      <UploadComponent />
    </Provider>
  </React.Fragment>
  );
}

export default App;
