export class NotImplementedException extends Error {
    constructor(message = 'Method not implemented!') {
        super(message);
    }
}