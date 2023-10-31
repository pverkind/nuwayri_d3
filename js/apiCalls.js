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
  } else if (versionID === "Shamela0007798"){
    return {
      "versionID": "Shamela0007798",
      "bookURI": "0310Tabari.JamicBayan",
      "lastMilestone": 9702
    }
  } else if (versionID === "JK008250Vols"){
    return {
      "versionID": "JK008250Vols",
      "bookURI": "0310Tabari.TahdhibAthar",
      "lastMilestone": 1155
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
