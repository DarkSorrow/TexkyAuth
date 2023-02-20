import * as flowClient from "@onflow/fcl";

import constant from '../configurations/constant.js';

flowClient
  .config()
  .put("accessNode.api", constant.flow.API)
  .put("flow.network", constant.flow.NETWORK);

export { flowClient }