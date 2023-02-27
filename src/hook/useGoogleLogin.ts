import { useState, useEffect } from "react";
import { loadScript, removeScript } from "../lib/helper";

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

/**

Hook to implement Google Authentication
@param {Object} params - The parameters to configure the hook
@param {function} params.onSuccess - The function to execute when authentication is successful
@param {function} params.onAutoLoadFinished - The function to execute when the automatic loading of the Google API has finished
@param {function} params.onFailure - The function to execute when authentication fails
@param {function} params.onRequest - The function to execute when an authentication request is made
@param {function} params.onScriptLoadFailure - The function to execute when the loading of the Google API script fails
@param {string} params.clientId - The Google API client ID
@param {string} [params.cookiePolicy] - The Google API cookie policy
@param {string} [params.loginHint] - The Google API login hint
@param {string} [params.hostedDomain] - The Google API hosted domain
@param {boolean} [params.autoLoad=true] - Whether to automatically load the Google API on component mount
@param {boolean} [params.isSignedIn=true] - Whether to check if the user is already signed in
@param {boolean} [params.fetchBasicProfile=true] - Whether to fetch the user's basic profile information
@param {string} [params.redirectUri] - The Google API redirect URI
@param {string[]} [params.discoveryDocs] - The Google API discovery documents
@param {string} [params.uxMode] - The Google API UX mode
@param {string} [params.scope] - The Google API scope
@param {string} [params.accessType] - The Google API access type
@param {string} [params.responseType] - The Google API response type
@param {string} [params.jsSrc="https://apis.google.com/js/api.js"] - The URL of the Google API script
@param {string} [params.prompt] - The Google API prompt
@returns {Object} - An object containing the click function to initiate authentication and a loaded flag indicating if the Google API has been loaded
*/

export const useGoogleLogin = (params: UseGoogleLoginParams) => {
  const {
    onSuccess = () => {},
    onAutoLoadFinished = () => {},
    onFailure = () => {},
    onRequest = () => {},
    onScriptLoadFailure,
    clientId,
    cookiePolicy,
    loginHint,
    hostedDomain,
    autoLoad,
    isSignedIn,
    fetchBasicProfile,
    redirectUri,
    discoveryDocs,
    uxMode,
    scope,
    accessType,
    responseType,
    jsSrc = "https://apis.google.com/js/api.js",
    prompt,
  } = params;

  const [loaded, setLoaded] = useState(false);

  function handleSigninSuccess(res) {
    /*
      offer renamed response keys to names that match use
    */
    const basicProfile = res.getBasicProfile();
    const authResponse = res.getAuthResponse(true);
    res.googleId = basicProfile.getId();
    res.tokenObj = authResponse;
    res.tokenId = authResponse.id_token;
    res.accessToken = authResponse.access_token;
    res.profileObj = {
      googleId: basicProfile.getId(),
      imageUrl: basicProfile.getImageUrl(),
      email: basicProfile.getEmail(),
      name: basicProfile.getName(),
      givenName: basicProfile.getGivenName(),
      familyName: basicProfile.getFamilyName(),
    };
    onSuccess(res);
    return res;
  }

  function click(e?: Event) {
    if (e) {
      e.preventDefault(); // to prevent submit if used within form
    }
    if (loaded) {
      const GoogleAuth = window.gapi.auth2.getAuthInstance();
      const options = {
        prompt,
      };
      onRequest();

      return new Promise((resolve, reject) => {
        if (responseType === "code") {
          GoogleAuth.grantOfflineAccess(options).then(
            (res) => {
              resolve(res);
              onSuccess(res);
            },
            (err) => {
              reject(err);
              onFailure(err);
            }
          );
        } else {
          GoogleAuth.signIn(options).then(
            (res) => resolve(handleSigninSuccess(res)),
            (err) => {
              reject(err);
              onFailure(err);
            }
          );
        }
      });
    }
  }

  useEffect(() => {
    let unmounted = false;
    const onLoadFailure = onScriptLoadFailure || onFailure;
    loadScript(
      document,
      "script",
      "google-login",
      jsSrc,
      () => {
        const params = {
          client_id: clientId,
          cookie_policy: cookiePolicy,
          login_hint: loginHint,
          hosted_domain: hostedDomain,
          fetch_basic_profile: fetchBasicProfile,
          discoveryDocs,
          ux_mode: uxMode,
          redirect_uri: redirectUri,
          scope,
          access_type: accessType,
        };

        if (responseType === "code") {
          params.access_type = "offline";
        }

        window.gapi.load("auth2", () => {
          const GoogleAuth = window.gapi.auth2.getAuthInstance();
          if (!GoogleAuth) {
            window.gapi.auth2.init(params).then(
              (res) => {
                if (!unmounted) {
                  setLoaded(true);
                  const signedIn = isSignedIn && res.isSignedIn.get();
                  onAutoLoadFinished(signedIn);
                  if (signedIn) {
                    handleSigninSuccess(res.currentUser.get());
                  }
                }
              },
              (err) => {
                setLoaded(true);
                onAutoLoadFinished(false);
                onLoadFailure(err);
              }
            );
          } else {
            GoogleAuth.then(
              () => {
                if (unmounted) {
                  return;
                }
                if (isSignedIn && GoogleAuth.isSignedIn.get()) {
                  setLoaded(true);
                  onAutoLoadFinished(true);
                  handleSigninSuccess(GoogleAuth.currentUser.get());
                } else {
                  setLoaded(true);
                  onAutoLoadFinished(false);
                }
              },
              (err) => {
                onFailure(err);
              }
            );
          }
        });
      },
      (err) => {
        onLoadFailure(err);
      }
    );

    return () => {
      unmounted = true;
      removeScript(document, "google-login");
    };
  }, []);

  useEffect(() => {
    if (autoLoad) {
      click();
    }
  }, [loaded]);

  return { click, loaded };
};
