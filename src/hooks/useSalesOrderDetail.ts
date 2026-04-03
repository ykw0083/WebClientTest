import { useQuery } from "@tanstack/react-query";
import { serviceLayerApi } from "../api";

export const useSalesOrderDetail = (docEntry: number | null) => {
  return useQuery({
    queryKey: ["getSalesOrderDetail", docEntry],
    queryFn: () => serviceLayerApi.getSalesOrderDetail(docEntry!),
    enabled: docEntry !== null,
  });
};
