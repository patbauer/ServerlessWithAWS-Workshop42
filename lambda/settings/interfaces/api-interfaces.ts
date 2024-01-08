export interface ApiDetails {
    baseUrl: string;
    authType?: string;
    apiKey?: string;
    additionalHeaders?: {
        [header: string]: string;
    };
}

export interface SettingRequestBody {
    settingId: string;
    apiDetails: ApiDetails;
    parameters?: {
        [key: string]: string;
    };
    description: string;
}
