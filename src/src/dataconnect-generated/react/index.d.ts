import { CreateTransportationProviderData, CreateTransportationProviderVariables, ListTransportationProvidersData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateTransportationProvider(options?: useDataConnectMutationOptions<CreateTransportationProviderData, FirebaseError, CreateTransportationProviderVariables>): UseDataConnectMutationResult<CreateTransportationProviderData, CreateTransportationProviderVariables>;
export function useCreateTransportationProvider(dc: DataConnect, options?: useDataConnectMutationOptions<CreateTransportationProviderData, FirebaseError, CreateTransportationProviderVariables>): UseDataConnectMutationResult<CreateTransportationProviderData, CreateTransportationProviderVariables>;

export function useListTransportationProviders(options?: useDataConnectQueryOptions<ListTransportationProvidersData>): UseDataConnectQueryResult<ListTransportationProvidersData, undefined>;
export function useListTransportationProviders(dc: DataConnect, options?: useDataConnectQueryOptions<ListTransportationProvidersData>): UseDataConnectQueryResult<ListTransportationProvidersData, undefined>;
