import { useMutation } from "@tanstack/react-query";
import { Modals } from "@ui5/webcomponents-react";
import { serviceLayerApi } from "../api";
import type { SalesOrderPayload } from "../api";

export const useCreateSalesOrder = (onSuccess: (docNum: number) => void) => {
  return useMutation({
    mutationFn: (payload: SalesOrderPayload) => serviceLayerApi.postSalesOrder(payload),
    onSuccess: (data) => {
      onSuccess(data.DocNum);
    },
    onError: (error: Error) => {
      Modals.showMessageBox({
        type: "Error",
        children: error.message,
      });
    },
  });
};
