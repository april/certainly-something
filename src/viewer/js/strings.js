export const strings = {
  keyUsages: [
    'CRL Signing',
    'Certificate Signing',
    'Key Agreement',
    'Data Encipherment',
    'Key Encipherment',
    'Non-Repudiation',
    'Digital Signature',
  ],

  san: [
    'Other Name',
    'RFC 822 Name',
    'DNS Name',
    'X.400 Address',
    'Directory Name',
    'EDI Party Name',
    'URI',
    'IP Address',
    'Registered ID',
  ],

  eKU: {
    '1.3.6.1.5.5.7.3.1': 'Server Authentication',
    '1.3.6.1.5.5.7.3.2': 'Client Authentication',
    '1.3.6.1.5.5.7.3.3': 'Code Signing',
    '1.3.6.1.5.5.7.3.4': 'E-mail Protection',
    '1.3.6.1.5.5.7.3.5': 'IPsec End System',
    '1.3.6.1.5.5.7.3.6': 'IPsec Tunnel',
    '1.3.6.1.5.5.7.3.7': 'IPSec User',
    '1.3.6.1.5.5.7.3.8': 'Timestamping',
    '1.3.6.1.5.5.7.3.9': 'OCSP Signing',
  },

  signature: {
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
  },

  aia: {
    '1.3.6.1.5.5.7.48.1': 'Online Certificate Status Protocol (OCSP)',
    '1.3.6.1.5.5.7.48.2': 'CA Issuers',
  },

  // this includes qualifiers as well
  cps: {
    '1.3.6.1.4.1': {
      name: 'Statement Identifier',
      value: undefined,
    },
    '1.3.6.1.5.5.7.2.1': {
      name: 'Practices Statement',
      value: undefined,
    },
    '1.3.6.1.5.5.7.2.2': {
      name: 'User Notice',
      value: undefined,
    },
    '2.16.840': {
      name: 'ANSI Organizational Identifier',
      value: undefined,
    },
    '2.23.140.1.1': {
      name: 'Certificate Type',
      value: 'Extended Validation',
    },
    '2.23.140.1.2.1': {
      name: 'Certificate Type',
      value: 'Domain Validation',
    },
    '2.23.140.1.2.2': {
      name: 'Certificate Type',
      value: 'Organization Validation',
    },
    '2.23.140.1.2.3': {
      name: 'Certificate Type',
      value: 'Individual Validation',
    },
    '2.23.140.1.3': {
      name: 'Certificate Type',
      value: 'Extended Validation (Code Signing)',
    },
    '2.23.140.1.31': {
      name: 'Certificate Type',
      value: '.onion Extended Validation',
    },
    '2.23.140.2.1': {
      name: 'Certificate Type',
      value: 'Test Certificate',
    },
  },
}
