# Получает геокоординаты из браузера и конвертирует в текстовый адрес

<p align="center">
    <b>Статус проекта: заготовка для внутреннего использования, но вы можете использовать код для своих целей.</b>
</p>

## Описание

- Предоставляет интерфейс для запроса и получения геокоординат (latitude, longitude) устройства пользователя. Для этого
  используется обертка над стандартным браузерным API. (Пользователь должен явно подтвердить свое согласие на
  использование.)
- Предоставляет интерфейс для взаимодействия с внешним сервисом обратного геокодирования. (Код бэкенд сервиса здесь не
  представлен).


## Get Started

Пример использования смотри в файле example.js

```js
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

```


## services/address-api

```ecmascript 6
import {
    AddressApiInterface,
    AddressApi,
    CachedAddressApi,
    ApiConfig,
    createAddressApi
} from './services/address-api/index.js';
```

### AddressApiInterface

Определяет контракты АПИ сервера. Расширяется при добавлении новых методов АПИ.

### AddressApi

Демо-пример реализации АПИ. Будет доработан после реализации бэкенд

### CachedAddressApi

Реализация АПИ с кешированием. Для хранения данных можно задать свою реализацию Хранилища.

### ApiConfig

Конфигурация

### function createAddressApi(options)

Фасад для создания экземпляра АПИ адресного сервиса

=========================================================================================

## services/geo-location

```ecmascript 6
import {
    GeoCoords,
    StorageInterface,
    InMemoryStorage,
    NavigatorGeoLocationService,
    CachedGeoLocationService,
    Config,
    createGeoLocation,
    GeoLocationServiceInterface,
    NotImplementedException
} from './services/geo-location/index.js';
```

### GeoCoords

Координаты

### GeoLocationServiceInterface

Контракты сервиса

### NavigatorGeoLocationService

Пример реализации, получение геокоординат через браузерное API

### CachedGeoLocationService

Пример реализации с кешированием

### StorageInterface

Контракт хранилища. Использовать, если надо реализовать своё хранилище, например CookieStorage, LocalStorage, RemoteStorage и т.д.

### InMemoryStorage

Простая реализация хранилища в памяти. Данные пропадут после перезагрузки страницы 

### NotImplementedException

Исключение. Выбрасывается если метод класса нельзя вызвать

### Config

Конфигурация

### function createGeoLocation(options)

Фасад для создания экземпляра сервиса.


## License

MIT
