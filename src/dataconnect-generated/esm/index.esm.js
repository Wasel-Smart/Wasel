import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'wasel',
  location: 'us-east4'
};

export const createDemoUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateDemoUser');
}
createDemoUserRef.operationName = 'CreateDemoUser';

export function createDemoUser(dc) {
  return executeMutation(createDemoUserRef(dc));
}

export const listAllVehiclesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllVehicles');
}
listAllVehiclesRef.operationName = 'ListAllVehicles';

export function listAllVehicles(dc) {
  return executeQuery(listAllVehiclesRef(dc));
}

export const getMyPaymentMethodsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyPaymentMethods');
}
getMyPaymentMethodsRef.operationName = 'GetMyPaymentMethods';

export function getMyPaymentMethods(dc) {
  return executeQuery(getMyPaymentMethodsRef(dc));
}

export const createPaymentMethodRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePaymentMethod', inputVars);
}
createPaymentMethodRef.operationName = 'CreatePaymentMethod';

export function createPaymentMethod(dcOrVars, vars) {
  return executeMutation(createPaymentMethodRef(dcOrVars, vars));
}

