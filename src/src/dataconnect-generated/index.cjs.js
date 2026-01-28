const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'coffee-spark-ai',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createTransportationProviderRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTransportationProvider', inputVars);
}
createTransportationProviderRef.operationName = 'CreateTransportationProvider';
exports.createTransportationProviderRef = createTransportationProviderRef;

exports.createTransportationProvider = function createTransportationProvider(dcOrVars, vars) {
  return executeMutation(createTransportationProviderRef(dcOrVars, vars));
};

const listTransportationProvidersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTransportationProviders');
}
listTransportationProvidersRef.operationName = 'ListTransportationProviders';
exports.listTransportationProvidersRef = listTransportationProvidersRef;

exports.listTransportationProviders = function listTransportationProviders(dc) {
  return executeQuery(listTransportationProvidersRef(dc));
};
