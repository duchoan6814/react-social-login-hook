interface UseGoogleLoginParams {
  onSuccess?: (res: any) => void;
  onAutoLoadFinished?: (signedIn: boolean) => void;
  onFailure?: (err: any) => void;
  onRequest?: () => void;
  onScriptLoadFailure?: (err: any) => void;
  clientId: string;
  cookiePolicy?: string;
  loginHint?: string;
  hostedDomain?: string;
  autoLoad?: boolean;
  isSignedIn?: boolean;
  fetchBasicProfile?: boolean;
  redirectUri?: string;
  discoveryDocs?: string[];
  uxMode?: string;
  scope?: string;
  accessType?: string;
  responseType?: string;
  jsSrc?: string;
  prompt?: string;
}

type ReturnType = {
  click: (e: Event) => void;
  loaded: boolean;
};

declare const useGoogleLogin: Function = (params: UseGoogleLoginParams) =>
  ReturnType;

export default useGoogleLogin;
