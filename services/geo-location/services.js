import {NotImplementedException} from './exceptions.js';
import {StorageInterface} from './storage';
import {GeoCoords} from './coords.js';

export class GeoLocationServiceInterface {
    constructor() {
        if (new.target === GeoLocationServiceInterface) {
            throw new TypeError();
        }
    }

    isGeolocationSupported() {
        throw new NotImplementedException();
    }

    async determineGeoPosition() {
        throw new NotImplementedException();
    }
}

export class NavigatorGeoLocationService extends GeoLocationServiceInterface {
    isGeolocationSupported() {
        return Boolean(navigator.geolocation);
    }

    /**
     * Получаем гео-координаты из браузера пользователя
     * Окно с запросом разрешения будет показано автоматически
     * @returns {Promise<GeoCoords>}
     */
    async determineGeoPosition() {
        let geoCoords = new GeoCoords();
        return new Promise((resolve, reject) => {
            if (!this.isGeolocationSupported()) {
                reject(geoCoords);
            }
            navigator.geolocation.watchPosition(({coords: {latitude, longitude}}) => {
                geoCoords.latitude = latitude;
                geoCoords.longitude = longitude;
                resolve(geoCoords);
            }, reject);
        });
    }
}

export class CachedGeoLocationService extends GeoLocationServiceInterface {
    /**
     * @type StorageInterface
     * @private
     */
    _storage = null;

    /**
     * @type GeoLocationServiceInterface
     * @private
     */
    _location = null;

    /**
     * @type string
     * @private
     */
    _cacheKey = '';

    /**
     * @param storage StorageInterface
     * @param geoLocationService GeoLocationServiceInterface
     */
    constructor(storage, geoLocationService) {
        if (!storage instanceof StorageInterface) {
            throw new TypeError('storage should implement the StorageInterface');
        }
        if (!geoLocationService instanceof GeoLocationServiceInterface) {
            throw new TypeError('geoLocationService should implement the GeoLocationServiceInterface');
        }
        super();
        this._storage = storage;
        this._location = geoLocationService;
        this._cacheKey = '44a34afa-a15f-4488-8398-be92e520144e'; // произвольный ключ
    }

    isGeolocationSupported() {
        return this._location.isGeolocationSupported();
    }

    /**
     * @returns {Promise<GeoCoords>}
     */
    async determineGeoPosition() {
        let coords = await this._storage.get(this._cacheKey);
        if (!coords) {
            try {
                coords = await this._location.determineGeoPosition();
            } catch (e) {
                // fallback to empty GeoCoords
                coords = new GeoCoords();
            }
            await this._storage.set(this._cacheKey, coords);
        }
        return coords;
    }

}
