import {GeoLocationServiceInterface, NavigatorGeoLocationService, CachedGeoLocationService} from "./services.js";
import {StorageInterface, InMemoryStorage} from './storage.js';

export {GeoLocationServiceInterface, NavigatorGeoLocationService, CachedGeoLocationService};
export {StorageInterface, InMemoryStorage};
export {GeoCoords} from './coords.js';
export {NotImplementedException} from './exceptions.js';

export class Config {
    useCache = true;
    cacheStorage = null;
}

/**
 * Создает сервис геолокации согласно опциям
 * @param options Config
 * @returns NavigatorGeoLocationService
 */
export function createGeoLocation(options) {
    if (!isObject(options)) {
        throw new TypeError('options should be an object');
    }
    options = Object.assign({}, new Config(), options);
    let service = new NavigatorGeoLocationService();
    if (options.useCache) {
        let cacheStorage;
        if (options.cacheStorage !== null) {
            if (!options.cacheStorage instanceof StorageInterface) {
                throw new TypeError('options.cacheStorage should be an instance of StorageInterface');
            }
            cacheStorage = options.cacheStorage;
        } else {
            cacheStorage = new InMemoryStorage();
        }
        service = new CachedGeoLocationService(cacheStorage, service);
    }
    return service;
}

function isObject(value) {
    return typeof value === 'object' && value !== null;
}
