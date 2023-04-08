import { SERVER_ENCRYPTION } from './ServerProt.js';
import { CLIENT_ENCRYPTION } from './ClientProt.js';

export default class Rsc177Encryption {
    static SPOOKY_THREAT = Buffer.from('QWxsIFJ1bmVTY2FwZSBjb2RlIGFuZCBkYXRhLCBpbmNsdWRpbmcgdGhpcyBtZXNzYWdlLCBhcmUgY29weXJpZ2h0IDIwMDMgSmFnZXggTHRkLiBVbmF1dGhvcmlzZWQgcmVwcm9kdWN0aW9uIGluIGFueSBmb3JtIGlzIHN0cmljdGx5IHByb2hpYml0ZWQuICBUaGUgUnVuZVNjYXBlIG5ldHdvcmsgcHJvdG9jb2wgaXMgY29weXJpZ2h0IDIwMDMgSmFnZXggTHRkIGFuZCBpcyBwcm90ZWN0ZWQgYnkgaW50ZXJuYXRpb25hbCBjb3B5cmlnaHQgbGF3cy4gVGhlIFJ1bmVTY2FwZSBuZXR3b3JrIHByb3RvY29sIGFsc28gaW5jb3Jwb3JhdGVzIGEgY29weSBwcm90ZWN0aW9uIG1lY2hhbmlzbSB0byBwcmV2ZW50IHVuYXV0aG9yaXNlZCBhY2Nlc3Mgb3IgdXNlIG9mIG91ciBzZXJ2ZXJzLiBBdHRlbXB0aW5nIHRvIGJyZWFrLCBieXBhc3Mgb3IgZHVwbGljYXRlIHRoaXMgbWVjaGFuaXNtIGlzIGFuIGluZnJpbmdlbWVudCBvZiB0aGUgRGlnaXRhbCBNaWxsaWVuaXVtIENvcHlyaWdodCBBY3QgYW5kIG1heSBsZWFkIHRvIHByb3NlY3V0aW9uLiBEZWNvbXBpbGluZywgb3IgcmV2ZXJzZS1lbmdpbmVlcmluZyB0aGUgUnVuZVNjYXBlIGNvZGUgaW4gYW55IHdheSBpcyBzdHJpY3RseSBwcm9oaWJpdGVkLiBSdW5lU2NhcGUgYW5kIEphZ2V4IGFyZSByZWdpc3RlcmVkIHRyYWRlbWFya3Mgb2YgSmFnZXggTHRkLiBZb3Ugc2hvdWxkIG5vdCBiZSByZWFkaW5nIHRoaXMgbWVzc2FnZSwgeW91IGhhdmUgYmVlbiB3YXJuZWQuLi4=', 'base64');
    static SPOOKY_LENGTH = Rsc177Encryption.SPOOKY_THREAT.length;

    encodeKey = 3141592; // pi
    decodeKey = 3141592; // pi

    writeThreatIndex = 0;
    readThreatIndex = 0;

    reset() {
        this.encodeKey = 3141592;
        this.decodeKey = 3141592;
        this.writeThreatIndex = 0;
        this.readThreatIndex = 0;
    }

    g1(stream) {
        let opcode = stream.g1();
        let real = (opcode - this.decodeKey) & 0xFF;
        let friend = CLIENT_ENCRYPTION[real];

        this.readThreatIndex = (this.readThreatIndex + friend) % Rsc177Encryption.SPOOKY_LENGTH;
        let threatChar = Rsc177Encryption.SPOOKY_THREAT[this.readThreatIndex];
        this.decodeKey = (this.decodeKey * 3 + threatChar + friend) & 0xFFFF;

        return real;
    }

    p1(stream, opcode) {
        stream.p1(opcode + this.encodeKey);

        let friend = SERVER_ENCRYPTION[opcode];
        this.writeThreatIndex = (this.writeThreatIndex + friend) % Rsc177Encryption.SPOOKY_LENGTH;
        let threatChar = Rsc177Encryption.SPOOKY_THREAT[this.writeThreatIndex];
        this.encodeKey = (this.encodeKey * 3 + threatChar + friend) & 0xFFFF;
    }
}
