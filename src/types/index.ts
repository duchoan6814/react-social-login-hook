export interface UseGoogleLoginParams {
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

export interface AppleLoginParams {
  clientId: string;
  redirectURI: string;
  autoLoad?: boolean;
  scope?: string;
  state?: string;
  responseType?: string | "code" | "id_token";
  responseMode?: string | "query" | "fragment" | "form_post";
  nonce?: string;
  usePopup?: boolean;
  designProp?: {
    // REF: https://developer.apple.com/documentation/signinwithapplejs/incorporating_sign_in_with_apple_into_other_platforms
    height?: number;
    width?: number;
    color?: string | "white" | "black";
    border?: boolean;
    type?: string | "sign-in" | "continue";
    border_radius?: number;
    scale?: number;
    locale?: string;
  };
  callback?: (d: any) => void;
}

type ResponseDataType = {
  accessToken: string;
  data_access_expiration_time: number;
  expiresIn: number;
  graphDomain: string;
  id: string;
  name: string;
  signedRequest: string;
  userID: string;
};

export interface FacebookLoginParams {
  isDisabled?: boolean;
  callback?: (data: ResponseDataType | { status: any }) => void;
  appId: string;
  xfbml?: boolean;
  cookie?: boolean;
  authType?: string;
  scope?: string;
  state?: string;
  responseType?: string;
  returnScopes?: boolean;
  redirectUri?: string;
  autoLoad?: boolean;
  disableMobileRedirect?: boolean;
  isMobile?: boolean;
  fields?: string;
  version?: string;
  language?: string;
  onClick?: (e?: Event) => void;
  onFailure?: (error: any) => void;
}

export type ReturnType = {
  loaded: boolean;
  onLick: (e?: Event) => void;
};

declare interface UseGoogleLoginType extends Function {
  (params: UseGoogleLoginParams): ReturnType;
}

declare interface UseAppleLoginType extends Function {
  (params: AppleLoginParams): ReturnType;
}

declare interface UseFacebookLoginType extends Function {
  (params: FacebookLoginParams): ReturnType;
}

export { UseGoogleLoginType, UseAppleLoginType, UseFacebookLoginType };
