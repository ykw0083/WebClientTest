import type { AxiosInstance, AxiosRequestConfig } from "axios";
import axios from "axios";
import type { SapApiConfig } from "./api.types";

const TOKEN_KEY = "AUTH_TOKEN";

interface SapApiLoginResponse {
  value: string;
}

export class SapApiClient {
  private static _instance: SapApiClient | null = null;
  private readonly client: AxiosInstance;

  static getInstance(): SapApiClient | null {
    return SapApiClient._instance;
  }

  static getSapInstance(): SapApiClient {
    if (!SapApiClient._instance) throw new Error("SAP API is not initialized");
    return SapApiClient._instance;
  }

  constructor(baseUrl: string, refreshAuth: () => Promise<string>) {
    this.client = axios.create({
      baseURL: baseUrl.replace(/\/$/, ""),
      headers: { "Content-Type": "application/json" },
    });

    this.client.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${localStorage.getItem(TOKEN_KEY)}`;
      return config;
    });

    this.client.interceptors.response.use(
      (res) => res,
      async (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
          error.config._retry = true;
          await refreshAuth();
          return this.client(error.config);
        }
        const { data } = error.response ?? {};
        const message = data?.message ?? data?.error ?? data?.Error ?? `HTTP ${status}`;
        throw new Error(message);
      },
    );
  }

  static async initialize(config: SapApiConfig) {
    const reauth = () => SapApiClient.login(config);
    SapApiClient._instance = new SapApiClient(config.U_ApiUrl, reauth);
    return SapApiClient._instance;
  }

  async fetch<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.request<T>({ url: path, ...config });
    return res.data;
  }

  private static async login(config: SapApiConfig) {
    const url = `${config.U_ApiUrl.replace(/\/$/, "")}/api/v1/SAPAuthentication/Login`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Username: config.U_Username,
        Password: config.U_Password,
      }),
    });
    if (!response.ok) throw new Error(`SAP Web API login failed: HTTP ${response.status}`);
    const data: SapApiLoginResponse = await response.json();
    localStorage.setItem(TOKEN_KEY, data.value);
    return data.value;
  }
}
