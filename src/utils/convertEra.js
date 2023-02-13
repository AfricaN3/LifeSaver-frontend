import { convertToreadable } from "./converter";

export function convertEra(era) {
  let convertedEra = [];
  for (let i = 0; i < era.length; i++) {
    if (i === 0) {
      let convertedAdmin = convertToreadable("address", era[i].value);
      convertedEra.push(convertedAdmin);
    }
    if (i === 1) {
      let convertedOrganization = convertToreadable("string", era[i].value);
      convertedEra.push(convertedOrganization);
    }
    if (i === 2) {
      let convertedDate = convertToreadable("string", era[i].value);
      convertedEra.push(convertedDate);
    }
    if (i === 3) {
      let convertedWinnersNo = convertToreadable("number", era[i].value);
      convertedEra.push(convertedWinnersNo);
    }
    if (i === 4) {
      let convertedMintFee = convertToreadable("number", era[i].value);
      convertedEra.push(convertedMintFee);
    }
    if (i === 5) {
      let convertedEraId = convertToreadable("bytenum", era[i].value);
      convertedEra.push(convertedEraId);
    }
    if (i === 6) {
      let convertedTotalSupply = convertToreadable("number", era[i].value);
      convertedEra.push(convertedTotalSupply);
    }
    if (i === 7) {
      let convertedStatus = convertToreadable("number", era[i].value);
      convertedEra.push(convertedStatus);
    }
    if (i === 8) {
      let convertedWinnersPaid = convertToreadable("number", era[i].value);
      convertedEra.push(convertedWinnersPaid);
    }
  }
  return convertedEra;
}
