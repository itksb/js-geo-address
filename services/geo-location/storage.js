import {NotImplementedException} from './exceptions.js';

export class StorageInterface {
    constructor() {
        if (new.target === StorageInterface) {
            throw new TypeError();
        }
    }

    async set(key, value) {
        throw new NotImplementedException();
    }

    async get(key) {
        throw new NotImplementedException();
    }
}

export class InMemoryStorage extends StorageInterface {
    /**
     * @type Map
     * @private
     */
    _map = null;

    constructor() {
        super();
        this._map = new Map();
    }

    async set(key, value) {
        this._map.set(key, value);
    }

    async get(key) {
        return this._map.get(key);
    }
}
