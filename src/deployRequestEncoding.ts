import { PopulatedTransaction, utils } from 'ethers';
import type { DeployRequestBody, HttpEnvelopingRequest } from './definitions';

const deployCallInterface = new utils.Interface([
  'function deployCall(((address relayHub,address from,address to,address tokenContract,address recoverer,uint256 value,uint256 gas,uint256 nonce,uint256 tokenAmount,uint256 tokenGas,uint256 validUntilTime,uint256 index,bytes data) request,(uint256 gasPrice,address feesReceiver,address callForwarder,address callVerifier) relayData) deployRequest, bytes signature)',
]);

const deployVerifierInterface = new utils.Interface([
  'function verifyRelayedCall(((address relayHub,address from,address to,address tokenContract,address recoverer,uint256 value,uint256 gas,uint256 nonce,uint256 tokenAmount,uint256 tokenGas,uint256 validUntilTime,uint256 index,bytes data) request,(uint256 gasPrice,address feesReceiver,address callForwarder,address callVerifier) relayData) relayRequest, bytes signature) returns (bytes context)',
]);

function buildDeployRequestValue(envelopingTransaction: HttpEnvelopingRequest) {
  const relayRequest = envelopingTransaction.relayRequest as unknown as {
    request: DeployRequestBody & {
      gas: string;
    };
    relayData: HttpEnvelopingRequest['relayRequest']['relayData'];
  };
  const { request, relayData } = relayRequest;

  return [
    [
      request.relayHub,
      request.from,
      request.to,
      request.tokenContract,
      request.recoverer,
      request.value,
      request.gas,
      request.nonce,
      request.tokenAmount,
      request.tokenGas,
      request.validUntilTime,
      request.index,
      request.data,
    ],
    [
      relayData.gasPrice,
      relayData.feesReceiver,
      relayData.callForwarder,
      relayData.callVerifier,
    ],
  ];
}

export function populateDeployCallTransaction(
  envelopingTransaction: HttpEnvelopingRequest
): PopulatedTransaction {
  return {
    to: envelopingTransaction.metadata.relayHubAddress,
    data: deployCallInterface.encodeFunctionData('deployCall', [
      buildDeployRequestValue(envelopingTransaction),
      envelopingTransaction.metadata.signature,
    ]),
  };
}

export function populateDeployVerifierTransaction(
  verifier: string,
  envelopingTransaction: HttpEnvelopingRequest,
  from: string
): PopulatedTransaction {
  return {
    to: verifier,
    from,
    data: deployVerifierInterface.encodeFunctionData('verifyRelayedCall', [
      buildDeployRequestValue(envelopingTransaction),
      envelopingTransaction.metadata.signature,
    ]),
  };
}
