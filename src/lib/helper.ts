/**
 * Removes a <script> element with the given ID from the DOM.
 *
 * @param {Document} d - The Document object representing the document to modify.
 * @param {string} id - The ID of the <script> element to remove.
 * @returns {void}
 */
export const removeScript = (d: Document, id: string): void => {
  const element = d.getElementById(id);

  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
};

/**
 * Load a script dynamically in the browser.
 *
 * @param {Document} d - The document object.
 * @param {string} s - The tag name of the script element to find in the document.
 * @param {string} id - The ID to give to the new script element.
 * @param {string} jsSrc - The URL of the script to load.
 * @param {() => void} cb - A callback to call once the script has loaded successfully.
 * @param {(event: ErrorEvent) => void} onError - A callback to call if the script fails to load.
 */
export const loadScript = (
  d: Document,
  s: string,
  id: string,
  jsSrc: string,
  cb: () => void,
  onError: (event: ErrorEvent) => void
) => {
  const element = d.getElementsByTagName(s)[0];
  const fjs = element;
  let js = element as HTMLScriptElement;
  js = d.createElement(s) as HTMLScriptElement;
  js.id = id;
  js.src = jsSrc;
  if (fjs && fjs.parentNode) {
    fjs.parentNode.insertBefore(js, fjs);
  } else {
    d.head.appendChild(js);
  }
  js.onerror = onError as (event: Event | string) => void;
  js.onload = cb;
};

/**
 * Decodes the value of a parameter with the specified key from a query string or URL fragment.
 * @param {string} paramString - The query string or URL fragment to decode.
 * @param {string} key - The key of the parameter to decode.
 * @returns {string} The decoded value of the parameter with the specified key.
 */
export const decodeParamForKey = (paramString: string, key: string): string => {
  return decodeURIComponent(
    paramString.replace(
      new RegExp(
        "^(?:.*[&\\?]" +
          encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") +
          "(?:\\=([^&]*))?)?.*$",
        "i"
      ),
      "$1"
    )
  );
};
/**
 * Returns a string of URL query parameters generated from an object.
 * @param params An object containing key-value pairs for the query parameters.
 * @returns A string of URL query parameters, e.g. "?param1=value1&param2=value2".
 */
export const getParamsFromObject = (params: {
  [key: string]: string;
}): string => {
  return (
    "?" +
    Object.keys(params)
      .map((param) => `${param}=${encodeURIComponent(params[param])}`)
      .join("&")
  );
};

/**
 * Generates a query string from an object of key-value pairs.
 * @param {Record<string, any>} q - The object to generate the query string from.
 * @returns {string} The generated query string.
 */
export const generateQueryString = (q: Record<string, any>): string => {
  let queryString = "";
  if (q) {
    const queryKeys = Object.keys(q);
    queryKeys.forEach((key) => {
      if (q[key]) {
        if (q[key].toString().length) {
          queryString += `${key}=${q[key]}&`;
        }
      }
    });
    if (queryKeys.length > 0 && queryString[queryString.length - 1] === "&") {
      queryString = queryString.slice(0, -1);
    }
  }
  return queryString;
};
