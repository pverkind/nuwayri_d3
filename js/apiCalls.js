const apiCall = async (apiURL, versionID) => {
  const response = await fetch(apiURL+versionID);
  const myJson = await response.json();

  let sel = {
    "versionID": versionID,
    "bookURI": myJson.book,
    "lastMilestone": Math.ceil(myJson.tok_length / 300)
  };
  console.log("in apiCall:");
  console.log(sel);
  return sel
}

function getMeta(versionID) {
  // will call API to get the metadata for a specific version
  if (versionID === "Shamela0011680") {
    return {
      "versionID": "Shamela0011680",
      "bookURI": "0346Istakhri.MasalikWaMamalik",
      "lastMilestone": 208
    }
  } else if (versionID === "Shamela0009783BK1"){
    return {
      "versionID": "Shamela0009783BK1",
      "bookURI": "0310Tabari.Tarikh",
      "lastMilestone": 4863
    }
  } else {
    let apiURL = "https://kitab-metadata-api.azurewebsites.net/version/";
    versionID = versionID.split("-")[0];

    const resp = apiCall(apiURL, versionID);
    console.log("in getMeta:");
    console.log(resp);
    return resp
  }
}
