import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface City_Key {
  id: UUIDString;
  __typename?: 'City_Key';
}

export interface CreateTransportationProviderData {
  transportationProvider_insert: TransportationProvider_Key;
}

export interface CreateTransportationProviderVariables {
  name: string;
  type: string;
}

export interface ListTransportationProvidersData {
  transportationProviders: ({
    id: UUIDString;
    name: string;
    type: string;
    contactEmail?: string | null;
    website?: string | null;
  } & TransportationProvider_Key)[];
}

export interface Route_Key {
  id: UUIDString;
  __typename?: 'Route_Key';
}

export interface SavedRoute_Key {
  id: UUIDString;
  __typename?: 'SavedRoute_Key';
}

export interface TransportationProvider_Key {
  id: UUIDString;
  __typename?: 'TransportationProvider_Key';
}

export interface Trip_Key {
  id: UUIDString;
  __typename?: 'Trip_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateTransportationProviderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTransportationProviderVariables): MutationRef<CreateTransportationProviderData, CreateTransportationProviderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTransportationProviderVariables): MutationRef<CreateTransportationProviderData, CreateTransportationProviderVariables>;
  operationName: string;
}
export const createTransportationProviderRef: CreateTransportationProviderRef;

export function createTransportationProvider(vars: CreateTransportationProviderVariables): MutationPromise<CreateTransportationProviderData, CreateTransportationProviderVariables>;
export function createTransportationProvider(dc: DataConnect, vars: CreateTransportationProviderVariables): MutationPromise<CreateTransportationProviderData, CreateTransportationProviderVariables>;

interface ListTransportationProvidersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListTransportationProvidersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListTransportationProvidersData, undefined>;
  operationName: string;
}
export const listTransportationProvidersRef: ListTransportationProvidersRef;

export function listTransportationProviders(): QueryPromise<ListTransportationProvidersData, undefined>;
export function listTransportationProviders(dc: DataConnect): QueryPromise<ListTransportationProvidersData, undefined>;

