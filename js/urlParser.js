const allOpenITIVersions = {
  "v1": "v2019.1.1",
  "v2": "v2020.1.2",
  "v3": "v2020.2.3",
  "v4" : "v2021.1.4",
  "v5" : "v2021.2.5"
};

function parseUrl() {
  let thisUrl = new Object();
  let url = window.location;
  console.log("URL: "+url);

  // parse the path and save elements in thisUrl object:

  let pathArray = url.pathname.split('/');  //
  console.log("pathArray: "+pathArray+' ('+pathArray.length+" elements)");
  if (pathArray.length > 2) {
    // get OpenITI version number:
    thisUrl.version = pathArray[2];
    if (!thisUrl.version.startsWith("v202")) {
      thisUrl.version = allOpenITIVersions[thisUrl.version] ;
    }
    // get the IDs of book1 and book2:
    var b1_b2 = pathArray[3];
    if (b1_b2 && b1_b2.includes("_")) {
      thisUrl.b1 = b1_b2[0];
      thisUrl.b2 = b1_b2[1];
    } else {
      thisUrl.b1 = b1_b2;
      thisUrl.b2 = "all" ;
    }
  } else {
    thisUrl.version = "v2021.2.5";
    thisUrl.b1 = null;
    thisUrl.b2 = null;
  }

  // parse the query parameters and save them in the thisUrl object:

  let queryString = url.search.toLowerCase();
  let urlParams = new URLSearchParams(queryString);
  thisUrl.urlParams = urlParams;
  let allParams = ["ms1", "ms2"];
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
