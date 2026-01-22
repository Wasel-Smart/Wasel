const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'wasel',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createDemoUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateDemoUser');
}
createDemoUserRef.operationName = 'CreateDemoUser';
exports.createDemoUserRef = createDemoUserRef;

exports.createDemoUser = function createDemoUser(dc) {
  return executeMutation(createDemoUserRef(dc));
};

const listAllVehiclesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllVehicles');
}
listAllVehiclesRef.operationName = 'ListAllVehicles';
exports.listAllVehiclesRef = listAllVehiclesRef;

exports.listAllVehicles = function listAllVehicles(dc) {
  return executeQuery(listAllVehiclesRef(dc));
};

const getMyPaymentMethodsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyPaymentMethods');
}
getMyPaymentMethodsRef.operationName = 'GetMyPaymentMethods';
exports.getMyPaymentMethodsRef = getMyPaymentMethodsRef;

exports.getMyPaymentMethods = function getMyPaymentMethods(dc) {
  return executeQuery(getMyPaymentMethodsRef(dc));
};

const createPaymentMethodRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePaymentMethod', inputVars);
}
createPaymentMethodRef.operationName = 'CreatePaymentMethod';
exports.createPaymentMethodRef = createPaymentMethodRef;

exports.createPaymentMethod = function createPaymentMethod(dcOrVars, vars) {
  return executeMutation(createPaymentMethodRef(dcOrVars, vars));
};
