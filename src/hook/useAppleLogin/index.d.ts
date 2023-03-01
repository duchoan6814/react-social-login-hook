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

type ReturnType = {
  click: (e: Event) => void;
  loaded: boolean;
};

declare const useAppleLogin: Function = (params: AppleLoginParams) =>
  ReturnType;

export default useAppleLogin;
