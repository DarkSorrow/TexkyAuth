import * as flowClient from "@onflow/fcl";

import constant from '../configurations/constant.js';

flowClient
  .config()
  .put("accessNode.api", constant.flow.API)
  .put("flow.network", constant.flow.NETWORK);


export const createFlowAcccount = () => {
  console.log('create an account with the master key and return the address');
  return 'address';
}

export const verifyAccountSignature = () => {
  console.log('check if the account is owned by the person and return it');
  return 'address';
}

export { flowClient }