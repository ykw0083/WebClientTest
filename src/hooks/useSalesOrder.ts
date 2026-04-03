import { useQuery } from "@tanstack/react-query";
import { serviceLayerApi } from "../api";

export const useSalesOrder = (params: { page: number; search: string }) => {
  return useQuery({
    queryKey: ["getSalesOrder", params.page, params.search],
    queryFn: () => serviceLayerApi.getSalesOrders(params),
  });
};
