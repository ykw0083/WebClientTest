import {
  type BusinessPartner,
  type ItemMaster,
  type ODataList,
  type SalesOrder,
  type SalesOrderPayload,
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
      const message = body?.error?.message?.value ?? body?.message ?? JSON.stringify(body) ?? "";
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

  async getBusinessPartners(params: {
    page: number;
    search?: string;
  }): Promise<{ value: BusinessPartner[]; count: number }> {
    const skip = params.page * 10;
    let url = `b1s/v2/BusinessPartners?$select=CardCode,CardName&$top=10&$skip=${skip}&$count=true&$filter=CardType eq 'C'`;
    if (params.search) {
      const escaped = params.search.replace(/'/g, "''");
      url += ` and (contains(CardCode,'${escaped}') or contains(CardName,'${escaped}'))`;
    }
    const response = await this.fetch<ODataList<BusinessPartner>>(url, { method: "GET" });
    return { value: response.value, count: response["@odata.count"] ?? 0 };
  }
  async getSalesOrderDetail(docEntry: number): Promise<SalesOrder> {
    return this.fetch<SalesOrder>(
      `b1s/v2/Orders(${docEntry})?$select=DocEntry,DocNum,CardCode,CardName,DocDate,DocDueDate,DocTotal,DocumentLines`,
      { method: "GET" },
    );
  }

  async postSalesOrder(payload: SalesOrderPayload): Promise<SalesOrder> {
    return this.fetch<SalesOrder>("b1s/v2/Orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getSalesOrders(params: {
    page: number;
    search?: string;
  }): Promise<{ value: SalesOrder[]; count: number }> {
    const skip = params.page * 10;
    let url = `b1s/v2/Orders?$select=DocEntry,DocNum,CardCode,CardName,DocDate,DocDueDate,DocTotal&$top=10&$skip=${skip}&$count=true`;
    if (params.search) {
      const escaped = params.search.replace(/'/g, "''");
      const conditions: string[] = [
        `contains(CardCode,'${escaped}')`,
        `contains(CardName,'${escaped}')`,
      ];
      if (/^\d+$/.test(params.search)) {
        conditions.push(`DocNum eq ${params.search}`);
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(params.search)) {
        conditions.push(`DocDate eq ${params.search}T00:00:00Z`);
      }
      url += `&$filter=${conditions.join(" or ")}`;
    }
    const response = await this.fetch<ODataList<SalesOrder>>(url, { method: "GET" });
    return { value: response.value, count: response["@odata.count"] ?? 0 };
  }

  async getItemMasters(params: {
    page: number;
    search?: string;
  }): Promise<{ value: ItemMaster[]; count: number }> {
    const skip = params.page * 10;
    let url = `b1s/v2/Items?$select=ItemCode,ItemName&$top=10&$skip=${skip}&$count=true`;
    if (params.search) {
      const escaped = params.search.replace(/'/g, "''");
      url += `&$filter=contains(ItemCode,'${escaped}') or contains(ItemName,'${escaped}')`;
    }
    const response = await this.fetch<ODataList<ItemMaster>>(url, { method: "GET" });
    return { value: response.value, count: response["@odata.count"] ?? 0 };
  }
}

export const serviceLayerApi = new ServiceLayerClient(import.meta.env.VITE_SL_BASE_URL);
