import {GeoCoords, NotImplementedException, StorageInterface} from '../geo-location/index.js';

export class AddressApiInterface {
    constructor(options) {
        if (new.target === AddressApiInterface) {
            throw new TypeError('You should not instantiate interface class!');
        }
    }

    /**
     * @param coords GeoCoords
     * @returns {Promise<string>}
     */
    async geolocateAddressByCoords(coords) {
        throw new NotImplementedException();
    }
}

export class AddressApi extends AddressApiInterface {
    /**
     * @type {string}
     * @private
     */
    _apiUrl = '';

    /** @param {apiUrl}  */
    constructor({apiUrl}) {
        if (typeof apiUrl !== 'string') {
            throw new TypeError('apiUrl has no string type');
        }
        if (!apiUrl.length) {
            throw new Error('apiUrl has zero length');
        }
        super({apiUrl});
        this._apiUrl = apiUrl;
    }

    /**
     * @param coords GeoCoords
     * @returns {Promise<string>}
     */
    async geolocateAddressByCoords(coords) {
        if (!coords instanceof GeoCoords) {
            throw new TypeError('coords should be an instance of GeoCoords!');
        }
        // здесь запросить даннные из АПИ (типа так await fetch(this._apiUrl)) и обработать ответ
        // в частности обработать ошибки. В результате всегда строка, но если не получилось - пустая. 
        return fetch(this._apiUrl);

    }
}

export class CachedAddressApi extends AddressApiInterface {
    /**
     * @type {StorageInterface}
     * @private
     */
    _storage = null;

    /**
     * @type {AddressApiInterface}
     * @private
     */
    _api = null;

    /**
     * @type {string}
     * @private
     */
    _cacheKey = '';

    _cacheLifetime = 0;

    get cacheLifetime() {
        return this._cacheLifetime;
    }

    set cacheLifetime(value) {
        if (!Number.isInteger(value)) {
            throw new TypeError('Wrong type of the cacheLifetime argument');
        }
        this._cacheLifetime = value;
    }

    constructor(storage, addressApi) {
        if (!storage instanceof StorageInterface) {
            throw new TypeError('storage should be an instanceof StorageInterface');
        }
        if (!addressApi instanceof AddressApiInterface) {
            throw new TypeError('addressApi should be an instanceof AddressApiInterface');
        }
        super();

        this._storage = storage;
        this._api = addressApi;
        this._cacheKey = 'em_geo';
        this._cacheLifetime = 24 * 60 * 60 * 1000; // 1 day by default 
    }

    async geolocateAddressByCoords(coords) {
        if (!coords instanceof GeoCoords) {
            throw new TypeError('Wrong argument type. It should be GeoCoords');
        }
        let address = await this._storage.get(this._cacheKey);
        if (address && this._isCacheValueNotExpired(address)) {
            address = this._unwrapValue(address);
        } else {
            address = await this._api.geolocateAddressByCoords(coords);
            await this._storage.set(
                this._cacheKey,
                this._wrapValue(
                    address,
                    this._createExpirationDate()
                )
            );
        }

        return address;
    }

    _unwrapValue(value) {
        return typeof value === 'object' && typeof value.value !== 'undefined' ? value.value : null;
    }

    _wrapValue(value, expirationDate) {
        return {value, expirationDate};
    }

    _createExpirationDate() {
        return new Date(Date.now() + this._cacheLifetime);
    }

    _isCacheValueNotExpired(value) {
        return typeof value === 'object'
            && typeof value.expirationDate !== 'undefined'
            && (new Date(value.expirationDate)).getTime() > Date.now();
    }
}