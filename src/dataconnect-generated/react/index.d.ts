import { CreateDemoUserData, ListAllVehiclesData, GetMyPaymentMethodsData, CreatePaymentMethodData, CreatePaymentMethodVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateDemoUser(options?: useDataConnectMutationOptions<CreateDemoUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateDemoUserData, undefined>;
export function useCreateDemoUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateDemoUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateDemoUserData, undefined>;

export function useListAllVehicles(options?: useDataConnectQueryOptions<ListAllVehiclesData>): UseDataConnectQueryResult<ListAllVehiclesData, undefined>;
export function useListAllVehicles(dc: DataConnect, options?: useDataConnectQueryOptions<ListAllVehiclesData>): UseDataConnectQueryResult<ListAllVehiclesData, undefined>;

export function useGetMyPaymentMethods(options?: useDataConnectQueryOptions<GetMyPaymentMethodsData>): UseDataConnectQueryResult<GetMyPaymentMethodsData, undefined>;
export function useGetMyPaymentMethods(dc: DataConnect, options?: useDataConnectQueryOptions<GetMyPaymentMethodsData>): UseDataConnectQueryResult<GetMyPaymentMethodsData, undefined>;

export function useCreatePaymentMethod(options?: useDataConnectMutationOptions<CreatePaymentMethodData, FirebaseError, CreatePaymentMethodVariables>): UseDataConnectMutationResult<CreatePaymentMethodData, CreatePaymentMethodVariables>;
export function useCreatePaymentMethod(dc: DataConnect, options?: useDataConnectMutationOptions<CreatePaymentMethodData, FirebaseError, CreatePaymentMethodVariables>): UseDataConnectMutationResult<CreatePaymentMethodData, CreatePaymentMethodVariables>;
