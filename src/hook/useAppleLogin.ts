import { useEffect } from "react";
import { generateQueryString } from "../lib/helper";
import { useScript } from "./useScript";

export interface AppleLoginProps {
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

export const useAppleLogin = (props: AppleLoginProps) => {
  const {
    clientId,
    redirectURI,
    state = "",
    responseMode = "query",
    responseType = "code",
    nonce,
    callback,
    scope,
    autoLoad = false,
    usePopup = false,
  } = props;

  const [loaded] = useScript(
    `https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/${
      (props && props.designProp && props.designProp.locale) || "en_US"
    }/appleid.auth.js`
  );

  const click = async (e?: Event) => {
    if (e) {
      e.preventDefault();
    }
    if (!usePopup) {
      window.location.href = `https://appleid.apple.com/auth/authorize?${generateQueryString(
        {
          response_type: responseType,
          response_mode: responseMode,
          client_id: clientId,
          redirect_uri: encodeURIComponent(redirectURI),
          state,
          nonce,
          scope: responseMode === "query" ? "" : scope,
        }
      )}`;
    } else {
      return new Promise((resolve, reject) => {
        window?.AppleID.auth
          .signIn()
          .then((data: any) => {
            if (data) {
              resolve(data);
              typeof callback === "function" && callback(data);
            }
          })
          .catch((error: any) => {
            if (typeof callback === "function") {
              reject({ error });
            }
          });
      });
    }
  };

  useEffect(() => {
    if (!usePopup) {
      if (autoLoad) {
        click();
      }

      if (
        typeof callback === "function" &&
        responseMode === "query" &&
        responseType === "code" &&
        window &&
        window.location
      ) {
        let match;
        const pl = /\+/g, // Regex for replacing addition symbol with a space
          search = /([^&=]+)=?([^&]*)/g,
          decode = (s: any) => {
            return decodeURIComponent(s.replace(pl, " "));
          },
          query = window.location.search.substring(1);

        const urlParams = {};
        while ((match = search.exec(query))) {
          urlParams[decode(match[1])] = decode(match[2]);
        }
        if (urlParams["code"]) {
          callback({
            code: urlParams["code"],
          });
        }
      }
    }
    return () => {};
  }, []);

  useEffect(() => {
    if (usePopup && loaded) {
      window?.AppleID?.auth.init({
        clientId,
        scope,
        redirectURI:
          redirectURI ||
          `${location.protocol}//${location.host}${location.pathname}`,
        state,
        nonce,
        usePopup,
      });

      // Call on auto load.
      if (autoLoad) {
        click();
      }
    }
    return () => {};
  }, [loaded, usePopup]);

  return {
    click,
    loaded,
  };
};
