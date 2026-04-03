import { useQuery } from "@tanstack/react-query";
import { serviceLayerApi } from "../api";

export const useItemMaster = () => {
  return useQuery({
    queryKey: ["getItemMaster"],
    queryFn: () => serviceLayerApi.getItemMasters(),
  });
};
