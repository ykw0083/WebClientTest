export interface ODataList<T> {
  value: T[];
  "@odata.count"?: number;
}

export interface ServiceLayerUser {
  data: {
    themeId: string;
    user: string;
    userId: number;
  };
}

export interface SapApiConfig {
  U_ApiUrl: string;
  U_Username: string;
  U_Password: string;
}

export type BusinessPartner = {
  CardCode: string;
  CardName: string;
};
export type ItemMaster = {
  ItemCode: string;
  ItemName: string;
};

export type SalesOrder = {
  DocEntry: number;
  DocNum: number;
  CardCode: string;
  CardName: string;
  DocDate: string;
  DocTotal: number;
};

export type SalesOrderPayload = {
  CardCode: string;
  DocDate: string;
  DocDueDate: string;
  DocumentLines: {
    ItemCode: string;
    Quantity: number;
    UnitPrice: number;
  }[];
};
