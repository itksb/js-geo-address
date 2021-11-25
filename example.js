import {createGeoLocation, InMemoryStorage} from './services/geo-location/index.js';
import {createAddressApi, ApiConfig,} from './services/address-api/index.js';

/**
 * Пример создания сервиса
 * @param setupRadioButtonsState Function - коллбэк, вызовется, когда адрес будет получен
 * @returns {function(): string}
 */
export function createOnFocusHandler(setupRadioButtonsState) {
    let result = () => '';

    const location = createGeoLocation({useCache: true});
    /**
     * Если браузер поддерживает геолокацию, тогда имеет смысл идти дальше, иначе вернем пустую функцию заглушку
     */
    if (location.isGeolocationSupported()) {
        const laravelApiConfig = new ApiConfig({
            /**
             * Обязательный атрибут.
             * Это адрес нашего бэкенда (на ларавель), который (бэкенд) уже будет запрашивать информацию
             * у стороннего сервис-провайдера. Наш фронтенд знает только "свой" сервер. Его адрес здесь и прописать.
             * Может быть относительный адрес, например: /api/address
             *
             * значение подставлять из .env файла при сборке
             */
            apiUrl: "/api/address",
            /**
             * Необязательный атрибут. (default: true)
             * Использовать ли кеш или нет. Лучше всегда ставить true, кроме целей отладки.
             */
            useCache: true,
            /**
             * Необязательный атрибут. (default: new InMemoryStorage())
             * InMemoryStorage - это заглушка. При перезагрузке приложения информация исчезнет
             * Надо реализовать свой вариант, например, CookieStorage или LocalStorage.
             * Для этого реализовать "интерфейс" StorageInterface  (geo-location/storage.js)
             * Смотри пример реализации InMemoryStorage
             *
             * Имеет смысл задавать, только если useCache: true (см. выше)
             */
            cacheStorage: new InMemoryStorage()
        });
        const laravelApi = createAddressApi(laravelApiConfig);
        result = () => location.determineGeoPosition()
            .then(geoCoords => laravelApi.geolocateAddressByCoords(geoCoords))
            .then(address => setupRadioButtonsState && setupRadioButtonsState(address))
            .catch(reason => console && console.warn && console.warn(reason));

    }

    return result;
}




