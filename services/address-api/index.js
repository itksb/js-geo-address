import {AddressApiInterface, AddressApi, CachedAddressApi} from './services.js';
import {InMemoryStorage, StorageInterface} from "../geo-location/index.js";

export {AddressApiInterface, AddressApi, CachedAddressApi};

export class ApiConfig {
    apiUrl = '';
    useCache = true;
    cacheStorage = null;

    /**
     * @param options Object
     * @param options.useCache Boolean
     * @param options.cacheStorage StorageInterface | null
     * @param options.apiUrl string e.g.: /api/address
     */
    constructor(options) {
        Object.assign(this, options);
    }
}

export function createAddressApi(options) {
    const config = Object.assign({}, new ApiConfig(), options);
    let api = new AddressApi(config.apiUrl);
    if (config.useCache) {
        let cacheStorage;
        if (options.cacheStorage !== null) {
            if (!options.cacheStorage instanceof StorageInterface) {
                throw new TypeError('options.cacheStorage should be an instance of StorageInterface');
            }
            cacheStorage = options.cacheStorage;
        } else {
            cacheStorage = new InMemoryStorage();
        }
        api = new CachedAddressApi(cacheStorage, api);
    }
    return api;
}