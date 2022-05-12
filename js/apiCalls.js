function getMeta(versionID) {
  // will call API to get the metadata for a specific version
  if (versionID === "Shamela0011680") {
    return {
      "versionID": "Shamela0011680",
      "bookURI": "0346Istakhri.MasalikWaMamalik",
      "lastMilestone": 208
    }
  } else {
    return {
      "versionID": "Shamela0010283",
      "bookURI": "0733Nuwayri.Nihaya",
      "lastMilestone": 7995
    }
  }
}


const getMilestoneText = async(releaseVersion, versionID, msNo) => {
  let DEBUG_BASE_URL = "http://127.0.0.1:8000";
  let PROD_BASE_URL = "";
  let baseUrl = DEBUG_BASE_URL;
  let url = `${baseUrl}/${releaseVersion}/${versionID}/ms/${msNo}/`;

  const resp = await fetch(url);
  const data = await resp.json();
  return data;
}



/*
const displayMilestoneText = async(divID, releaseVersion, versionID, msNo, start, end)  => {
  //getMilestoneText(window.OpenITIVersion, versionID, msNo);
  let DEBUG_BASE_URL = "http://127.0.0.1:8000";
  let PROD_BASE_URL = "";
  let baseUrl = DEBUG_BASE_URL;
  console.log("releaseVersion:"+releaseVersion);
  let url = `${baseUrl}/${releaseVersion}/${versionID}/ms/${msNo}/`;

  const resp = await fetch(url);
  const data = await resp.json();
  console.log(data);
  d3.select(divID)
    .html(data["ms_text"].substring(start, end));
  return data
}
*/
