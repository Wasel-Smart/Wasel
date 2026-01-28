import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'default',
  service: 'coffee-spark-ai',
  location: 'us-east4'
};

export const createTransportationProviderRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTransportationProvider', inputVars);
}
createTransportationProviderRef.operationName = 'CreateTransportationProvider';

export function createTransportationProvider(dcOrVars, vars) {
  return executeMutation(createTransportationProviderRef(dcOrVars, vars));
}

export const listTransportationProvidersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTransportationProviders');
}
listTransportationProvidersRef.operationName = 'ListTransportationProviders';

export function listTransportationProviders(dc) {
  return executeQuery(listTransportationProvidersRef(dc));
}

