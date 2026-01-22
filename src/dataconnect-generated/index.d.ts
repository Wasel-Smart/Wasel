import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateDemoUserData {
  user_insertMany: User_Key[];
}

export interface CreatePaymentMethodData {
  paymentMethod_insert: PaymentMethod_Key;
}

export interface CreatePaymentMethodVariables {
  type: string;
  cardHolderName: string;
  lastFourDigits: string;
  expiryDate: string;
  isDefault: boolean;
}

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

export interface Location_Key {
  id: UUIDString;
  __typename?: 'Location_Key';
}

export interface PaymentMethod_Key {
  id: UUIDString;
  __typename?: 'PaymentMethod_Key';
}

export interface Ride_Key {
  id: UUIDString;
  __typename?: 'Ride_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface Vehicle_Key {
  id: UUIDString;
  __typename?: 'Vehicle_Key';
}

interface CreateDemoUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateDemoUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateDemoUserData, undefined>;
  operationName: string;
}
export const createDemoUserRef: CreateDemoUserRef;

export function createDemoUser(): MutationPromise<CreateDemoUserData, undefined>;
export function createDemoUser(dc: DataConnect): MutationPromise<CreateDemoUserData, undefined>;

interface ListAllVehiclesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllVehiclesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllVehiclesData, undefined>;
  operationName: string;
}
export const listAllVehiclesRef: ListAllVehiclesRef;

export function listAllVehicles(): QueryPromise<ListAllVehiclesData, undefined>;
export function listAllVehicles(dc: DataConnect): QueryPromise<ListAllVehiclesData, undefined>;

interface GetMyPaymentMethodsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyPaymentMethodsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyPaymentMethodsData, undefined>;
  operationName: string;
}
export const getMyPaymentMethodsRef: GetMyPaymentMethodsRef;

export function getMyPaymentMethods(): QueryPromise<GetMyPaymentMethodsData, undefined>;
export function getMyPaymentMethods(dc: DataConnect): QueryPromise<GetMyPaymentMethodsData, undefined>;

interface CreatePaymentMethodRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePaymentMethodVariables): MutationRef<CreatePaymentMethodData, CreatePaymentMethodVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePaymentMethodVariables): MutationRef<CreatePaymentMethodData, CreatePaymentMethodVariables>;
  operationName: string;
}
export const createPaymentMethodRef: CreatePaymentMethodRef;

export function createPaymentMethod(vars: CreatePaymentMethodVariables): MutationPromise<CreatePaymentMethodData, CreatePaymentMethodVariables>;
export function createPaymentMethod(dc: DataConnect, vars: CreatePaymentMethodVariables): MutationPromise<CreatePaymentMethodData, CreatePaymentMethodVariables>;

