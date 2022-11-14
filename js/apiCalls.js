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
    return {
      "versionID": "Shamela0010283",
      "bookURI": "0733Nuwayri.Nihaya",
      "lastMilestone": 7995
    }
  }
}
