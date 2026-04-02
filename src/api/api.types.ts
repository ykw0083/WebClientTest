export interface ODataList<T> {
  value: T[];
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
