# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListAllVehicles*](#listallvehicles)
  - [*GetMyPaymentMethods*](#getmypaymentmethods)
- [**Mutations**](#mutations)
  - [*CreateDemoUser*](#createdemouser)
  - [*CreatePaymentMethod*](#createpaymentmethod)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListAllVehicles
You can execute the `ListAllVehicles` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAllVehicles(): QueryPromise<ListAllVehiclesData, undefined>;

interface ListAllVehiclesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllVehiclesData, undefined>;
}
export const listAllVehiclesRef: ListAllVehiclesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllVehicles(dc: DataConnect): QueryPromise<ListAllVehiclesData, undefined>;

interface ListAllVehiclesRef {
  ...
  (dc: DataConnect): QueryRef<ListAllVehiclesData, undefined>;
}
export const listAllVehiclesRef: ListAllVehiclesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllVehiclesRef:
```typescript
const name = listAllVehiclesRef.operationName;
console.log(name);
```

### Variables
The `ListAllVehicles` query has no variables.
### Return Type
Recall that executing the `ListAllVehicles` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllVehiclesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAllVehiclesData {
  vehicles: ({
    id: UUIDString;
    make: string;
    model: string;
    year: number;
    capacity: number;
    vehicleType: string;
    color: string;
    licensePlate: string;
  } & Vehicle_Key)[];
}
```
### Using `ListAllVehicles`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllVehicles } from '@dataconnect/generated';


// Call the `listAllVehicles()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllVehicles();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllVehicles(dataConnect);

console.log(data.vehicles);

// Or, you can use the `Promise` API.
listAllVehicles().then((response) => {
  const data = response.data;
  console.log(data.vehicles);
});
```

### Using `ListAllVehicles`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllVehiclesRef } from '@dataconnect/generated';


// Call the `listAllVehiclesRef()` function to get a reference to the query.
const ref = listAllVehiclesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllVehiclesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.vehicles);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.vehicles);
});
```

## GetMyPaymentMethods
You can execute the `GetMyPaymentMethods` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMyPaymentMethods(): QueryPromise<GetMyPaymentMethodsData, undefined>;

interface GetMyPaymentMethodsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyPaymentMethodsData, undefined>;
}
export const getMyPaymentMethodsRef: GetMyPaymentMethodsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyPaymentMethods(dc: DataConnect): QueryPromise<GetMyPaymentMethodsData, undefined>;

interface GetMyPaymentMethodsRef {
  ...
  (dc: DataConnect): QueryRef<GetMyPaymentMethodsData, undefined>;
}
export const getMyPaymentMethodsRef: GetMyPaymentMethodsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyPaymentMethodsRef:
```typescript
const name = getMyPaymentMethodsRef.operationName;
console.log(name);
```

### Variables
The `GetMyPaymentMethods` query has no variables.
### Return Type
Recall that executing the `GetMyPaymentMethods` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyPaymentMethodsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetMyPaymentMethodsData {
  paymentMethods: ({
    id: UUIDString;
    type: string;
    cardHolderName?: string | null;
    lastFourDigits: string;
    expiryDate?: string | null;
    isDefault: boolean;
    createdAt: TimestampString;
  } & PaymentMethod_Key)[];
}
```
### Using `GetMyPaymentMethods`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyPaymentMethods } from '@dataconnect/generated';


// Call the `getMyPaymentMethods()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyPaymentMethods();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyPaymentMethods(dataConnect);

console.log(data.paymentMethods);

// Or, you can use the `Promise` API.
getMyPaymentMethods().then((response) => {
  const data = response.data;
  console.log(data.paymentMethods);
});
```

### Using `GetMyPaymentMethods`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyPaymentMethodsRef } from '@dataconnect/generated';


// Call the `getMyPaymentMethodsRef()` function to get a reference to the query.
const ref = getMyPaymentMethodsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyPaymentMethodsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.paymentMethods);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentMethods);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateDemoUser
You can execute the `CreateDemoUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createDemoUser(): MutationPromise<CreateDemoUserData, undefined>;

interface CreateDemoUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateDemoUserData, undefined>;
}
export const createDemoUserRef: CreateDemoUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createDemoUser(dc: DataConnect): MutationPromise<CreateDemoUserData, undefined>;

interface CreateDemoUserRef {
  ...
  (dc: DataConnect): MutationRef<CreateDemoUserData, undefined>;
}
export const createDemoUserRef: CreateDemoUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createDemoUserRef:
```typescript
const name = createDemoUserRef.operationName;
console.log(name);
```

### Variables
The `CreateDemoUser` mutation has no variables.
### Return Type
Recall that executing the `CreateDemoUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateDemoUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateDemoUserData {
  user_insertMany: User_Key[];
}
```
### Using `CreateDemoUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createDemoUser } from '@dataconnect/generated';


// Call the `createDemoUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createDemoUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createDemoUser(dataConnect);

console.log(data.user_insertMany);

// Or, you can use the `Promise` API.
createDemoUser().then((response) => {
  const data = response.data;
  console.log(data.user_insertMany);
});
```

### Using `CreateDemoUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createDemoUserRef } from '@dataconnect/generated';


// Call the `createDemoUserRef()` function to get a reference to the mutation.
const ref = createDemoUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createDemoUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insertMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insertMany);
});
```

## CreatePaymentMethod
You can execute the `CreatePaymentMethod` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createPaymentMethod(vars: CreatePaymentMethodVariables): MutationPromise<CreatePaymentMethodData, CreatePaymentMethodVariables>;

interface CreatePaymentMethodRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePaymentMethodVariables): MutationRef<CreatePaymentMethodData, CreatePaymentMethodVariables>;
}
export const createPaymentMethodRef: CreatePaymentMethodRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createPaymentMethod(dc: DataConnect, vars: CreatePaymentMethodVariables): MutationPromise<CreatePaymentMethodData, CreatePaymentMethodVariables>;

interface CreatePaymentMethodRef {
  ...
  (dc: DataConnect, vars: CreatePaymentMethodVariables): MutationRef<CreatePaymentMethodData, CreatePaymentMethodVariables>;
}
export const createPaymentMethodRef: CreatePaymentMethodRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createPaymentMethodRef:
```typescript
const name = createPaymentMethodRef.operationName;
console.log(name);
```

### Variables
The `CreatePaymentMethod` mutation requires an argument of type `CreatePaymentMethodVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreatePaymentMethodVariables {
  type: string;
  cardHolderName: string;
  lastFourDigits: string;
  expiryDate: string;
  isDefault: boolean;
}
```
### Return Type
Recall that executing the `CreatePaymentMethod` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreatePaymentMethodData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreatePaymentMethodData {
  paymentMethod_insert: PaymentMethod_Key;
}
```
### Using `CreatePaymentMethod`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createPaymentMethod, CreatePaymentMethodVariables } from '@dataconnect/generated';

// The `CreatePaymentMethod` mutation requires an argument of type `CreatePaymentMethodVariables`:
const createPaymentMethodVars: CreatePaymentMethodVariables = {
  type: ..., 
  cardHolderName: ..., 
  lastFourDigits: ..., 
  expiryDate: ..., 
  isDefault: ..., 
};

// Call the `createPaymentMethod()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createPaymentMethod(createPaymentMethodVars);
// Variables can be defined inline as well.
const { data } = await createPaymentMethod({ type: ..., cardHolderName: ..., lastFourDigits: ..., expiryDate: ..., isDefault: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPaymentMethod(dataConnect, createPaymentMethodVars);

console.log(data.paymentMethod_insert);

// Or, you can use the `Promise` API.
createPaymentMethod(createPaymentMethodVars).then((response) => {
  const data = response.data;
  console.log(data.paymentMethod_insert);
});
```

### Using `CreatePaymentMethod`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createPaymentMethodRef, CreatePaymentMethodVariables } from '@dataconnect/generated';

// The `CreatePaymentMethod` mutation requires an argument of type `CreatePaymentMethodVariables`:
const createPaymentMethodVars: CreatePaymentMethodVariables = {
  type: ..., 
  cardHolderName: ..., 
  lastFourDigits: ..., 
  expiryDate: ..., 
  isDefault: ..., 
};

// Call the `createPaymentMethodRef()` function to get a reference to the mutation.
const ref = createPaymentMethodRef(createPaymentMethodVars);
// Variables can be defined inline as well.
const ref = createPaymentMethodRef({ type: ..., cardHolderName: ..., lastFourDigits: ..., expiryDate: ..., isDefault: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPaymentMethodRef(dataConnect, createPaymentMethodVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paymentMethod_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentMethod_insert);
});
```

