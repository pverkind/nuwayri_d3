const allOpenITIVersions = {
  "v1": "v2019.1.1",
  "v2": "v2020.1.2",
  "v3": "v2020.2.3",
  "v4": "v2021.1.4",
  "v5": "v2021.2.5",
  "v6": "v2022.1.6",
  "v7": "v2022.2.7",
  "v8": "v2023.1.8"
};

const defaultOpenITIVersion = "2023.1.8";

/*Parse the URL of the current window and return it as an object

  This is a temporary function; OpenITI version should be passed 
  as "v=2022.2.7", "v=2023.1.8", etc.
*/

function parseUrl() {
  // parse the path:
  let url = window.location;
  let queryString = url.search; //.toLowerCase();
  let urlParams = new URLSearchParams(queryString);

  // get the OpenITI version from the URL or use the default:
  let OpenITIVersion;
  if (urlParams.has("v")) {
    OpenITIVersion = urlParams.get("v");
  } else {
    //OpenITIVersion = "2023.1.8";
    // reload the page with the default OpenITI version in the URL:
    console.log(url);
    urlParams.set('v', defaultOpenITIVersion);
    window.location.search = urlParams;
  }

  // save elements in thisUrl object:
  let thisUrl = new Object();
  thisUrl.url = url;
  thisUrl.urlParams = urlParams;
  thisUrl.OpenITIVersion = OpenITIVersion;

  // parse the query parameters and save them in the thisUrl object:
  
  let allParams = ["id1", "id2", "ms1", "ms2", "v"];
  for (const p of allParams) {
    if (urlParams.has(p)) {
      thisUrl[p] = urlParams.get(p);
    } else {
      thisUrl[p] =  null;
    }
  }
  for (const p of urlParams.keys()) {
    if (!allParams.includes(p)) {
      console.log("Unknown url parameter in " + url + " : " + p) ;
     }
  }

  console.log(thisUrl);


 /*
  // check if the URL contains an anchor; split it off and save it into the thisUrl object:
  if (url.includes("#")) {
    thisUrl.anchor = url.split("#")[1];
    url = url.split("#")[0];
  } else {
    thisUrl.anchor = null;
  }
  */
  thisUrl.anchor = location.hash;  // see https://www.google.com/amp/s/www.geeksforgeeks.org/html-dom-location-hash-property/amp/

  return thisUrl;
}
