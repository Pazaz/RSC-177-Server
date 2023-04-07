import fs from 'fs';

import pkg, { ASN1Construction, ASN1TagClass, ASN1UniversalType } from 'asn1-ts';
const { DERElement } = pkg;

let n = 192956484481579778191558061814292671521n;
let e = 18439792161837834709n;

// factored using yafu
let d = 80671108003703759362513259812649815933n;
let p = 16323021537482305537n;
let q = 11821125398780902433n;
let dP = 3671620338775486333n; // d mod (p-1)
let dQ = 2467996465760991997n; // d mod (q-1)
let qInv = 9913549803553164424n; // (inverse of q) mod p

function wrapString(str, width) {
    return str.match(new RegExp(`.{1,${width}}`, 'g')).join('\n');
}

let pubKey = new DERElement(null, ASN1Construction.constructed, ASN1UniversalType.sequence, [
    n,
    e
]);

fs.writeFileSync('data/public.pem', wrapString(`-----BEGIN RSA PUBLIC KEY-----\n${Buffer.from(pubKey.toBytes()).toString('base64')}\n-----END RSA PUBLIC KEY-----`, 64));

// see: https://myarch.com/public-private-key-file-formats
let privKey = new DERElement(null, ASN1Construction.constructed, ASN1UniversalType.sequence, [
    0, // version
    n, // modulus
    e, // publicExponent
    d, // privateExponent
    p, // prime1
    q, // prime2
    dP, // exponent1
    dQ, // exponent2
    qInv // coefficient
]);

fs.writeFileSync('data/private.pem', wrapString(`-----BEGIN RSA PRIVATE KEY-----\n${Buffer.from(privKey.toBytes()).toString('base64')}\n-----END RSA PRIVATE KEY-----`, 64));

/// ---- testing decryption ----

import forge from 'node-forge';

const pub = forge.pki.publicKeyFromPem(fs.readFileSync('data/public.pem'));
const priv = forge.pki.privateKeyFromPem(fs.readFileSync('data/private.pem'));

let encrypted = pub.encrypt('hello world', 'RAW', 'NONE');
let decrypted = priv.decrypt(encrypted, 'RAW', 'NONE');
console.log(decrypted);
