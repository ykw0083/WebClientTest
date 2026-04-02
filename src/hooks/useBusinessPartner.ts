import { useQuery } from "@tanstack/react-query";
import { serviceLayerApi } from "../api";

export const useBusinessPartner = () => {
  return useQuery({
    queryKey: ["getBusinessPartner"],
    queryFn: () => serviceLayerApi.getBusinessPartners(),
  });
};
