import { useEffect } from "react";
import { generateQueryString } from "../../lib/helper";
import { useScript } from "../useScript";

const useAppleLogin = (props) => {
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

  const click = async (e) => {
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
          .then((data) => {
            if (data) {
              resolve(data);
              typeof callback === "function" && callback(data);
            }
          })
          .catch((error) => {
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
          decode = (s) => {
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

export default useAppleLogin;
