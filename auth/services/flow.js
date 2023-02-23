import * as flowClient from "@onflow/fcl";
import { send } from '@onflow/transport-grpc';
import * as t from '@onflow/types';
import elliptic from 'elliptic';
import { SHA3 } from 'sha3';

import constant from '../configurations/constant.js';


const ec = new elliptic.ec('p256'); // or 'secp256k1'
const toBytesWithTag = (str) => {
  // Tag: '464c4f572d56302e302d75736572000000000000000000000000000000000000'
  // ref: https://github.com/onflow/flow-go-sdk/blob/9bb50d/sign.go
  const tagBytes = Buffer.alloc(32);
  Buffer.from('FLOW-V0.0-user').copy(tagBytes);
  const strBytes = Buffer.from(str);
  return Buffer.concat([tagBytes, strBytes]);
}

const hashMsg = (msg) => {
  const sha = new SHA3(256);
  return sha.update(toBytesWithTag(msg)).digest();
};

const signMessage = (privKey, msg) => {
  const key = ec.keyFromPrivate(Buffer.from(privKey, 'hex'));
  const sig = key.sign(hashMsg(msg));
  const n = 32;
  const r = sig.r.toArrayLike(Buffer, 'be', n);
  const s = sig.s.toArrayLike(Buffer, 'be', n);
  return Buffer.concat([r, s]).toString('hex');
};

const toHexStr = (str) => {
  return Buffer.from(str).toString('hex');
}

// different from /api/flow.js as there is no signer and such.
const verifySig = async (pubKey, msg, sig, script) => {
  const response = await flowClient.send([
    flowClient.script`${script}`,
    flowClient.args([
      flowClient.arg([pubKey], t.Array(t.String)),
      flowClient.arg(['1.0'], t.Array(t.UFix64)),
      flowClient.arg([sig], t.Array(t.String)),
      flowClient.arg(toHexStr(msg), t.String),
    ])
  ]);
  return await flowClient.decode(response);
}

// https://github.com/justinbarry/simple-fcl-grpc-test
flowClient
  .config()
  .put("accessNode.api", constant.flow.API)
  .put("flow.network", constant.flow.NETWORK);
  //.put("sdk.send", send);


export const createFlowAcccount = () => {
  console.log('create an account with the master key and return the address');
  return 'address';
}

export const verifyAccountSignature = () => {
  console.log('check if the account is owned by the person and return it');
  return 'address';
}

export { flowClient }
