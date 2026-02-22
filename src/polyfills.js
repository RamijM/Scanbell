// ULTIMATE STABLE POLYFILLS: Universal browser environment for Agora SDKs
if (typeof global.self === 'undefined') global.self = global;
if (typeof global.window === 'undefined') global.window = global;

// 1. URL & Blob
import 'react-native-url-polyfill/auto';
if (global.URL) {
    global.URL.createObjectURL = (blob) => 'blob:react-native/' + Math.random();
    global.URL.revokeObjectURL = () => { };
}

// 2. Text Encoding
import { TextEncoder, TextDecoder } from 'fast-text-encoding';
global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;

// 3. Performance & Timing
global.performance = global.performance || { now: () => Date.now() };
global.requestAnimationFrame = global.requestAnimationFrame || ((cb) => setTimeout(cb, 0));
global.cancelAnimationFrame = global.cancelAnimationFrame || ((id) => clearTimeout(id));

// 4. Crypto
import 'react-native-get-random-values';
if (!global.crypto) {
    global.crypto = {
        getRandomValues: (byteArray) => {
            for (let i = 0; i < byteArray.length; i++) {
                byteArray[i] = Math.floor(Math.random() * 256);
            }
            return byteArray;
        },
    };
}

// 5. Worker (Proper Constructor)
global.Worker = class Worker {
    constructor() {
        this.onmessage = null;
        this.onerror = null;
    }
    postMessage() { }
    terminate() { }
    addEventListener() { }
    removeEventListener() { }
};

// 6. EVENT SYSTEM
if (typeof global.Event === 'undefined') {
    global.Event = class Event { constructor(type) { this.type = type; } };
}
if (typeof global.EventTarget === 'undefined') {
    global.EventTarget = class EventTarget {
        constructor() { this._listeners = {}; }
        addEventListener(type, callback) {
            if (!this._listeners[type]) this._listeners[type] = [];
            this._listeners[type].push(callback);
        }
        removeEventListener(type, callback) {
            if (!this._listeners[type]) return;
            this._listeners[type] = this._listeners[type].filter(l => l !== callback);
        }
        dispatchEvent(event) {
            if (!this._listeners[event.type]) return true;
            this._listeners[event.type].forEach(callback => callback(event));
            return true;
        }
    };
}

// 7. Base64
global.atob = global.atob || require('base-64').decode;
global.btoa = global.btoa || require('base-64').encode;

// 8. Navigator
global.navigator = {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X)',
    onLine: true,
    platform: 'iPhone',
    vendor: 'Apple Computer, Inc.',
    appCodeName: 'Mozilla',
    appName: 'Netscape',
    appVersion: '5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X)',
    language: 'en-US',
    languages: ['en-US', 'en'],
    mediaDevices: { enumerateDevices: () => Promise.resolve([]), getUserMedia: () => Promise.reject() },
};

// 9. Location
const locationObj = {
    protocol: 'https:', hostname: 'localhost', href: 'https://localhost',
    search: '', origin: 'https://localhost', pathname: '/', host: 'localhost',
    assign: () => { }, replace: () => { }, reload: () => { }
};
global.location = global.location || locationObj;

// 10. LocalStorage
global.localStorage = {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
    clear: () => { },
    key: () => null,
    length: 0,
};

// 11. Document (Deeper Mock)
const dummyFn = () => { };
const dummyElem = {
    getContext: () => ({}),
    style: {},
    setAttribute: dummyFn,
    removeAttribute: dummyFn,
    tagName: 'DIV',
    appendChild: dummyFn,
    removeChild: dummyFn,
    addEventListener: dummyFn,
    removeEventListener: dummyFn,
};

global.document = {
    readyState: 'complete',
    visibilityState: 'visible',
    location: locationObj,
    body: dummyElem,
    head: dummyElem,
    documentElement: { style: {} },
    addEventListener: dummyFn,
    removeEventListener: dummyFn,
    createElement: () => dummyElem,
    createElementNS: () => dummyElem,
    getElementsByTagName: (name) => {
        if (name === 'head' || name === 'body') return [dummyElem];
        return [];
    },
    querySelector: () => null,
    getElementById: () => null,
    cookie: '',
};

// 12. Window Extensions
global.window.scrollTo = dummyFn;
global.window.alert = global.alert || console.log;

// 13. RTC Stubs
global.RTCPeerConnection = global.RTCPeerConnection || class { };
global.RTCSessionDescription = global.RTCSessionDescription || class { };
global.RTCIceCandidate = global.RTCIceCandidate || class { };
global.MediaStream = global.MediaStream || class { };

// 14. Process
global.process = global.process || {};
global.process.env = global.process.env || {};
global.process.browser = true;
global.process.nextTick = global.process.nextTick || ((fn) => setTimeout(fn, 0));
