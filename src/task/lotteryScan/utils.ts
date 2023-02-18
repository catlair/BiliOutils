const enquoteBigNumber = (jsonString: string) =>
  jsonString.replace(/"business_id":(\d+)/, '"business_id":"$1"');

export function parseJson(jsonString: string) {
  return JSON.parse(enquoteBigNumber(jsonString), (key, value) =>
    key === 'business_id' ? BigInt(value) : value,
  );
}
