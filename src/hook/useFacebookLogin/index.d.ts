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

declare type Props = {
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
};

type ReturnType = {
  click: (e: Event) => void;
  loaded: boolean;
};

declare const useFacebookLogin: Function = (params: Props) => ReturnType;

export default useFacebookLogin;
