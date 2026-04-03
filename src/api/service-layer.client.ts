import {
  type BusinessPartner,
  type ItemMaster,
  type ODataList,
  type SapApiConfig,
  type ServiceLayerUser,
} from "./api.types";

export class ServiceLayerClient {
  private baseUrl: string = "";

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async login(company: string, username: string, password: string) {
    const response = await this.fetch("b1s/v2/Login", {
      method: "POST",
      body: JSON.stringify({
        CompanyDB: company,
        UserName: username,
        Password: password,
      }),
    });
    return response;
  }

  async fetch<T>(path: string, init?: RequestInit): Promise<T> {
    const url = import.meta.env.DEV
      ? `${this.baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`
      : `${path.startsWith("/") ? path : `/${path}`}`;
    const res = await fetch(url, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    if (!res.ok) {
      const body = await res.json();
      const message = body?.error?.message?.value ?? body?.message ?? body?.error ?? "";
      throw new Error(message);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  async getCurrentUser(): Promise<ServiceLayerUser> {
    return this.fetch<ServiceLayerUser>("tcli/service/data/user.svc", {
      method: "GET",
    });
  }

  async getSapApiConfig(): Promise<SapApiConfig> {
    const res = await this.fetch<ODataList<{ Code: string; U_Value: string }>>(
      "b1s/v2/FTAPICONFIG?$select=Code,U_Value",
    );
    const byCode = Object.fromEntries(res.value.map((r) => [r.Code, r.U_Value]));
    return {
      U_ApiUrl: byCode["ApiUrl"],
      U_Username: byCode["Username"],
      U_Password: byCode["Password"],
    };
  }

  async getBusinessPartners(): Promise<BusinessPartner[]> {
    const response = await this.fetch<ODataList<BusinessPartner>>(
      "b1s/v2/BusinessPartners?$select=CardCode,CardName&$filter=CardType eq 'C'&$top=10",
      {
        method: "GET",
      },
    );
    return response.value;
  }
  async getItemMasters(): Promise<ItemMaster[]> {
    const response = await this.fetch<ODataList<ItemMaster>>(
      "b1s/v2/Items?$select=ItemCode,ItemName&$top=10",
      {
        method: "GET",
      },
    );
    return response.value;
  }
}

export const serviceLayerApi = new ServiceLayerClient(import.meta.env.VITE_SL_BASE_URL);
