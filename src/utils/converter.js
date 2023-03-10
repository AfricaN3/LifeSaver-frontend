import { u, sc, wallet } from "@cityofzion/neon-js";

// Make recursive if map, return value of the function
export function toStackItemValue(type, value) {
  if (value !== undefined) {
    switch (type) {
      case "Map":
        // Value is an array of object with key and value that are stackitems
        const res = [];
        for (const _value of value) {
          res.push({
            key: toStackItemValue(_value.key.type, _value.key.value),
            value: toStackItemValue(_value.value.type, _value.value.value),
          });
        }
        return res;
      case "ByteString":
        /*
			// NB: If the value is String or ByteArray, it is encoded by Base64
			const hexValue = u.base642hex(value);
			// if it's an address return it as a scripthash (littleEndian so reverse it)
			if (wallet.isScriptHash(u.reverseHex(hexValue))) {
				return wallet.getAddressFromScriptHash(u.reverseHex(hexValue));
			}
			if (!isNaN(u.HexString.fromHex(u.reverseHex(hexValue)).toNumber())) {
				return u.HexString.fromHex(u.reverseHex(hexValue)).toNumber();
			}
			// ToString -> u.hexstring2str(hexValue)
			// ToNumber -> u.HexString.fromHex(u.reverseHex(hexValue)).toNumber()
			// ToAddress (If scripthash) -> wallet.getAddressFromScriptHash(u.reverseHex(hexValue))
			*/
        return value;
      default:
        return value;
    }
  }
}

// https://github.com/CityOfZion/neon-js/blob/v5.0.0-next.16/packages/neon-core/src/sc/ContractParam.ts
export function toInvocationArgument(type, value) {
  const arg = { type, value };

  switch (type) {
    case "Any":
      arg.value = null;
      break;
    case "Boolean":
      // Does basic checks to convert value into a boolean. Value field will be a boolean.
      let _value = value;
      if (typeof _value === "string") {
        _value = _value === "true" || _value === "1";
      }
      arg.value = sc.ContractParam.boolean(_value).toJson().value;
      break;
    case "Integer":
      // A value that can be parsed to a BigInteger. Numbers or numeric strings are accepted.
      arg.value = sc.ContractParam.integer(value).toJson().value;
      break;
    case "ByteArray":
      // A string or HexString.
      arg.value = sc.ContractParam.byteArray(value).toJson().value;
      break;
    case "String":
      // UTF8 string.
      arg.value = sc.ContractParam.string(value).toJson().value;
      break;
    case "Hash160":
      // A 40 character (20 bytes) hexstring. Automatically converts an address to scripthash if provided.
      arg.value = sc.ContractParam.hash160(value).toJson().value;
      break;
    case "Hash256":
      // A 64 character (32 bytes) hexstring.
      arg.value = sc.ContractParam.hash256(value).toJson().value;
      break;
    case "PublicKey":
      // A public key (both encoding formats accepted)
      arg.value = sc.ContractParam.publicKey(value).toJson().value;
      break;
    case "Signature":
      // TODO: NOT SUPPORTED
      break;
    case "Array":
      // Pass an array as JSON [{type: 'String': value: 'blabla'}]
      arg.value = sc.ContractParam.fromJson(value).toJson().value;
      break;
    case "Map":
      // TODO: NOT SUPPORTED
      break;
    case "InteropInterface":
      // TODO: NOT SUPPORTED
      break;
    case "Void":
      // Value field will be set to null.
      arg.value = null;
      break;
  }

  return arg;
}

export function dateToString(yourDate) {
  const offset = yourDate.getTimezoneOffset();
  yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
  return yourDate.toISOString().split("T")[0];
}

export function convertToreadable(type, value) {
  if (value !== undefined) {
    let parsedValue = value;
    switch (type) {
      case "default":
        parsedValue = value;
        break;
      case "string":
        if (u.isHex(value)) {
          parsedValue = u.hexstring2str(value);
        } else {
          let new_str = `${value.slice(0, -3)}1`;
          console.log(value);
          console.log(new_str);
          let bytestring = `Z${value.slice(-3)}`;
          let decodedBytestring = u.hexstring2str(u.base642hex(bytestring));
          parsedValue = `${u
            .hexstring2str(new_str)
            .slice(0, -1)}${decodedBytestring}`;
        }
        break;
      case "number":
        parsedValue = parseInt(value);
        break;
      case "bytenum":
        parsedValue = u.HexString.fromHex(
          u.reverseHex(u.base642hex(value))
        ).toNumber();
        break;
      case "address":
        parsedValue = wallet.getAddressFromScriptHash(
          u.reverseHex(u.base642hex(value))
        );
        break;
    }
    return parsedValue;
  }
}

export const convertPermissions = (value) => {
  if (value !== undefined) {
    return u.hexstring2str(u.base642hex(value));
  }
};

export const convertAddressFromEvent = (value) => {
  if (value !== undefined) {
    return wallet.getAddressFromScriptHash(
      u.reverseHex(u.str2hexstring(value))
    );
  }
};
