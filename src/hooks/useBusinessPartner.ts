import { useQuery } from "@tanstack/react-query";
import { serviceLayerApi } from "../api";

export const useBusinessPartner = (params: { page: number; search: string }) => {
  return useQuery({
    queryKey: ["getBusinessPartner", params.page, params.search],
    queryFn: () => serviceLayerApi.getBusinessPartners(params),
  });
};
