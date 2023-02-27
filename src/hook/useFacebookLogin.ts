/* eslint-disable prefer-const */
/* eslint-disable no-useless-escape */
import { useState, useEffect } from "react";
import { getParamsFromObject, decodeParamForKey } from "../lib/helper";

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

export const useFacebookLogin = (props: Props) => {
  const {
    autoLoad,
    appId,
    isDisabled,
    redirectUri = typeof window !== "undefined" ? window.location.href : "/",
    callback,
    scope = "public_profile,email",
    returnScopes = false,
    xfbml = false,
    cookie = false,
    authType = "",
    fields = "name",
    version = "2.8",
    language = "en_US",
    disableMobileRedirect = false,
    isMobile = false,
    onFailure = null,
    onClick,
    state = "facebookdirect",
    responseType = "code",
  } = props;

  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (document.getElementById("facebook-jssdk")) {
      setIsSdkLoaded(true);
      return;
    }
    setFbAsyncInit();
    loadSdkAsynchronously();
    let fbRoot = document.getElementById("fb-root");
    if (!fbRoot) {
      fbRoot = document.createElement("div");
      fbRoot.id = "fb-root";
      document.body.appendChild(fbRoot);
    }
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (isSdkLoaded && autoLoad) {
      window.FB.getLoginStatus(checkLoginAfterRefresh);
    }
  }, [isSdkLoaded, autoLoad]);

  const setFbAsyncInit = () => {
    window.fbAsyncInit = () => {
      window.FB.init({
        version: `v${version}`,
        appId,
        xfbml,
        cookie,
      });
      if (isMounted) {
        setIsSdkLoaded(true);
      }
      if (autoLoad || isRedirectedFromFb()) {
        window.FB.getLoginStatus(checkLoginAfterRefresh);
      }
    };
  };

  const isRedirectedFromFb = () => {
    const params = window.location.search;
    return (
      decodeParamForKey(params, "code") ||
      decodeParamForKey(params, "granted_scopes")
    );
  };

  const loadSdkAsynchronously = () => {
    (function (d, s, id) {
      let js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  };

  const responseApi = (authResponse) => {
    window.FB.api("/me", { locale: language, fields }, (me) => {
      Object.assign(me, authResponse);
      typeof callback === "function" && callback(me);
    });
  };

  const checkLoginState = (response) => {
    setIsProcessing(false);
    if (response.authResponse) {
      responseApi(response.authResponse);
    } else {
      if (onFailure) {
        onFailure({ status: response.status });
      } else {
        callback({ status: response.status });
      }
    }
  };

  const checkLoginAfterRefresh = (response) => {
    if (response.status === "connected") {
      checkLoginState(response);
    } else {
      window.FB.login((loginResponse) => checkLoginState(loginResponse), true);
    }
  };

  const click = (e?: Event) => {
    if (!isSdkLoaded || isProcessing || isDisabled) {
      return;
    }
    setIsProcessing(true);

    if (typeof onClick === "function") {
      onClick?.(e);
      if (e?.defaultPrevented) {
        setIsProcessing(false);
        return;
      }
    }

    const params = {
      client_id: appId,
      redirect_uri: redirectUri,
      state,
      return_scopes: returnScopes,
      scope,
      response_type: responseType,
      auth_type: authType,
    };

    if (isMobile && !disableMobileRedirect) {
      window.location.href = `https://www.facebook.com/dialog/oauth${getParamsFromObject(
        params
      )}`;
    } else {
      return new Promise((resolve, reject) => {
        if (!window.FB) {
          if (onFailure) {
            reject({ status: "facebookNotLoaded" });

            onFailure({ status: "facebookNotLoaded" });
          }

          return;
        }

        window.FB.login(
          (response) => {
            window.FB.api("/me", { locale: language, fields }, (me) => {
              Object.assign(me, response?.authResponse);
              resolve(me);
            });

            checkLoginState(response);
          },
          {
            scope,
            return_scopes: returnScopes,
            auth_type: params.auth_type,
          }
        );
      });
    }
  };

  return {
    click,
    loaded: isSdkLoaded,
  };
};
