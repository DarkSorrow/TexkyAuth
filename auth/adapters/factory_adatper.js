import ClientAdapter from './client_adapter.js';
import DefaultAdapter from './default_adapter.js';

class FactoryAdapter {
  constructor(name) {
    return (name === 'Client') ? new ClientAdapter(name) : new DefaultAdapter(name);
  }
}

export default FactoryAdapter;
