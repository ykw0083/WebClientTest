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

export type DocumentLine = {
  ItemCode: string;
  ItemDescription: string;
  Quantity: number;
  UnitPrice: number;
  LineTotal: number;
};

export type SalesOrder = {
  DocEntry: number;
  DocNum: number;
  CardCode: string;
  CardName: string;
  DocDate: string;
  DocDueDate: string;
  DocTotal: number;
  DocumentLines?: DocumentLine[];
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
