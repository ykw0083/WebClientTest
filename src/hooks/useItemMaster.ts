import { useQuery } from "@tanstack/react-query";
import { serviceLayerApi } from "../api";

export const useItemMaster = (params: { page: number; search: string }) => {
  return useQuery({
    queryKey: ["getItemMaster", params.page, params.search],
    queryFn: () => serviceLayerApi.getItemMasters(params),
  });
};
