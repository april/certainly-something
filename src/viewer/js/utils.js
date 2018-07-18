import Integer from 'asn1js';
import { fromBase64, stringToArrayBuffer} from 'pvutils';


export const b64urltodec = (b64) => {
  return new Integer({ valueHex: stringToArrayBuffer(fromBase64('AQAB', true, true)) }).valueBlock._valueDec;
};


export const b64urltohex = (b64) => {
  const hexBuffer = new Integer({ valueHex: stringToArrayBuffer(fromBase64(b64, true, true)) }).valueBlock._valueHex;
  const hexArray = Array.from(new Uint8Array(hexBuffer));

  return hexArray.map(b => ('00' + b.toString(16)).slice(-2));
};

export const hash = async (algo, buffer) => {
  const hashBuffer = await crypto.subtle.digest(algo, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join(':').toUpperCase();
};

export const hashify = (hash) => {
  if (typeof hash === 'string') {
    return hash.match(/.{2}/g).join(':').toUpperCase();
  } else {
    return hash.join(':').toUpperCase();
  }
}

// this particular prototype override makes it easy to chain down complex objects
export const getObjPath = (obj, path) => {
    for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
        if (Array.isArray(obj[path[i]])){
            obj = obj[path[i]][ path[i+1]];
            i++;
        } else {
            obj = obj[path[i]];
        }

    };

    return obj;
};
