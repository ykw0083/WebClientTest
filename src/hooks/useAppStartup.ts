import { useQuery } from "@tanstack/react-query";
import { SapApiClient, serviceLayerApi, type SapApiConfig } from "../api";

const SL_CREDENTIALS = {
  CompanyDB: import.meta.env.VITE_SL_COMPANY as string,
  UserName: import.meta.env.VITE_SL_USER as string,
  Password: import.meta.env.VITE_SL_PASSWORD as string,
};

const isDev = import.meta.env.DEV;

export const useAppStartup = () => {
  const serviceLayerLogin = useQuery({
    queryKey: ["service-layer-login"],
    queryFn: () =>
      serviceLayerApi.login(
        SL_CREDENTIALS.CompanyDB,
        SL_CREDENTIALS.UserName,
        SL_CREDENTIALS.Password,
      ),
    enabled: isDev,
  });

  const sapApiConfig = useQuery({
    queryKey: ["sap-config"],
    queryFn: () => serviceLayerApi.getSapApiConfig(),
    enabled: isDev ? serviceLayerLogin.isSuccess : true,
  });

  const sapApiLogin = useQuery({
    queryKey: ["sap-login"],
    queryFn: () => {
      if (!sapApiConfig.data) throw new Error("SAP API configuration is not available");
      return SapApiClient.initialize(sapApiConfig.data as SapApiConfig);
    },
    enabled: !!sapApiConfig.data,
  });

  const currentUser = useQuery({
    queryKey: ["current-user"],
    queryFn: () => serviceLayerApi.getCurrentUser(),
    enabled: !isDev,
    staleTime: Infinity,
  });

  const isPending =
    (isDev && serviceLayerLogin.isPending) ||
    sapApiConfig.isPending ||
    sapApiLogin.isPending ||
    (!isDev && currentUser.isPending);

  return { isPending, user: currentUser.data?.data };
};
