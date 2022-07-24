import React from 'react';
import { Provider } from 'react-redux';
import { Switch, Route, BrowserRouter, Redirect} from 'react-router-dom';

import UploadComponent from './components/UploadComponent';
import store from './Redux/store';
import 'antd/dist/antd.min.css';

function App() {
  return (<React.Fragment>
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          <Route exact path='/'>
            <Redirect to="/tigerassessment" component={UploadComponent} />
          </Route>
          <Route exact path="/tigerassessment" component={UploadComponent} />
        </Switch>
      </BrowserRouter>
    </Provider>
  </React.Fragment>
  );
}

export default App;
