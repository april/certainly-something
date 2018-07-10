import * as asn1js from './pkijs/asn1.js';
import Certificate from './pkijs/Certificate.js';

// this particular prototype override makes it easy to chain down complex objects
const get = (obj, path) => {
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

const getX509Ext = (extensions, v) => {
  for (var extension in extensions) {
    if (extensions[extension].extnID === v) {
      return extensions[extension].parsedValue
    }
  }
};

const getHash = async (algo, buffer) => {
  const hashBuffer = await crypto.subtle.digest(algo, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join(':').toUpperCase();
};

const hashify = (hash) => {
  return hash.match(/.{2}/g).join(':').toUpperCase();
}

const parseSubsidiary = (obj) => {
  var path = [];

  const subsidiary = {
    'cn': undefined,
    'c': undefined,
    'l': undefined,
    's': undefined,
    'address': undefined,
    'o': undefined,
    'ou': undefined,
  };

  const usefulOIDs = {
    '2.5.4.3': 'cn',
    '2.5.4.6': 'c',        // country
    '2.5.4.7': 'l',        // locality
    '2.5.4.8': 's',        // state or province name
    '2.5.4.9': 'address',
    '2.5.4.10': 'o',
    '2.5.4.11': 'ou',
  };

  for (var attribute in obj) {
    var attr = obj[attribute];
    // console.log('attribute is', obj[attribute]);
    if (attr.type in usefulOIDs) {
      // add it to the subsidary
      subsidiary[usefulOIDs[attr.type]] = attr.value.valueBlock.value;
      path.push(`${usefulOIDs[attr.type].toUpperCase()}=${attr.value.valueBlock.value}`);
    } else {
      // append to the path because we didn't understand something
      path.push(`??=${attr.value.valueBlock.value}`);
    }
  }

  // add the path to the subsidiary
  path.reverse();
  subsidiary['path'] = path.join(', ');

  return subsidiary;
};


export const parse = async (der) => {
  console.log('called into parse()');
  const keyUsageNames = [
    'CRL Signing',
    'Certificate Signing',
    'Key Agreement',
    'Data Encipherment',
    'Key Encipherment',
    'Non-Repudiation',
    'Digital Signature',
  ];

  const signatureNames = {
    '1.2.840.113549.1.1.5': 'SHA-1 with RSA Encryption',
    '1.2.840.113549.1.1.11': 'SHA-256 with RSA Encryption',
    '1.2.840.113549.1.1.12': 'SHA-384 with RSA Encryption',
    '1.2.840.113549.1.1.13': 'SHA-512 with RSA Encryption',
    '1.2.840.10040.4.3': 'DSA with SHA-1',
    '2.16.840.1.101.3.4.3.2': 'DSA with SHA-256',
    '1.2.840.10045.4.1': 'ECDSA with SHA-1',
    '1.2.840.10045.4.3.2': 'ECDSA with SHA-256',
    '1.2.840.10045.4.3.3': 'ECDSA with SHA-384',
    '1.2.840.10045.4.3.4': 'ECDSA with SHA-512',
  };

  // parse the DER
  const asn1 = asn1js.fromBER(der.buffer);
  var x509 = new Certificate({ schema: asn1.result });
  x509 = x509.toJSON()

  // convert the cert to PEM
  const certBTOA = window.btoa(String.fromCharCode.apply(null, der)).match(/.{1,64}/g).join('\r\n');

  // get the subjectAltNames
  let san = getX509Ext(x509.extensions, '2.5.29.17');
  if (san !== undefined && san.hasOwnProperty('altNames')) {
    san = Object.keys(san.altNames).map(x => san.altNames[x].value);
  } else {
    san = [];
  }

  // get the keyUsages
  const keyUsages = [];
  let keyUsagesBS = getX509Ext(x509.extensions, '2.5.29.15');
  if (keyUsagesBS !== undefined) {
    // parse the bit string, shifting as necessary
    let unusedBits = keyUsagesBS.valueBlock.unusedBits;
    keyUsagesBS = parseInt(keyUsagesBS.valueBlock.valueHex, 16) >> unusedBits;

    // iterate through the bit string
    keyUsageNames.splice(unusedBits - 1).forEach(usage => {
      if (keyUsagesBS & 1) {
        keyUsages.push(usage);
      }

      keyUsagesBS = keyUsagesBS >> 1;
    })

    // reverse the order for legibility
    keyUsages.reverse();
  };

  // get the embedded SCTs
  let scts = getX509Ext(x509.extensions, '1.3.6.1.4.1.11129.2.4.2');
  if (scts !== undefined) {
    scts = Object.keys(scts.timestamps).map(x => {
      return {
        logId: hashify(scts.timestamps[x].logID),
        signatureAlgorithm: `${scts.timestamps[x].hashAlgorithm.replace('sha', 'SHA-')} ${scts.timestamps[x].signatureAlgorithm.toUpperCase()}`,
        timestamp: scts.timestamps[x].timestamp.toLocaleString(),
        version: scts.timestamps[x].version + 1,
      }
    });
  } else {
    scts = [];
  }

  console.log('returning from parse() for cert', x509);

  // the output shell
  return {
    files: {
      der: undefined,
      pem: encodeURI(`-----BEGIN CERTIFICATE-----\r\n${certBTOA}\r\n-----END CERTIFICATE-----\r\n`),
    },
    fingerprint: {
      'sha1': await getHash('SHA-1', der.buffer),
      'sha256': await getHash('SHA-256', der.buffer),
    },
    keyUsages: keyUsages,
    issuer: parseSubsidiary(x509.issuer.typesAndValues),
    notBefore: x509.notBefore.value.toLocaleString(),
    notAfter: x509.notAfter.value.toLocaleString(),
    scts: scts,
    subject: parseSubsidiary(x509.subject.typesAndValues),
    serialNumber: hashify(get(x509, 'serialNumber.valueBlock.valueHex')),
    signature: {
      name: signatureNames[get(x509, 'signature.algorithmId')],
      type: get(x509, 'signature.algorithmId'),
    },
    subjectAltNames: san,
    version: (x509.version + 1).toString(),
  }




  // console.log('here is the asn1', asn1);
  // console.log('here is the cert', x509);

  // let's see if we can do this
  // console.log('serial number', get(x509, 'serialNumber.valueBlock.valueHex'));

  // console.log('here is the cert so far', cert);

};

const fml = async () => {
  return await parse(myDER);
}

// fml();
