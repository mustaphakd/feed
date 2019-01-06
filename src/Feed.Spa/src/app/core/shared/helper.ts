import { inspect } from 'util';
import * as moment from 'moment';
import * as tps from './types';


export function validateNotNull(item: any, errorMessage: string = ''): void {
    tps.validateNotNull(item, errorMessage);
}

export function isDefined(item: any): boolean {
    return tps.isDefined(item);
}

export function validateTextualString(item: string): void {
    const stringEmpty = isStringEmpty(item);

    if (stringEmpty) { throw new Error('Invalid string -' + item); }

    const match = /[A-Za-z]+/.exec(item);

    if (! isDefined(match)) {
        window.alert('Invalid string');
        return;
    }
}

export  function isStringEmpty(item: string): boolean {
   return tps.isStringEmpty(item);
}

export function validateStringNotEmpty(item: string): void {
    tps.validateStringNotEmpty(item);
}

export function collectionAny<T>(collection: T[], comparer: (item: T) => boolean) {
    validateNotNull(collection);
    let foundItem: T = null;
    const collectionLength = collection.length;

    for (let i = 0; i < collectionLength; i++) {
        const item = collection[i];
        if (comparer(item)) {
            foundItem = item;
            break;
        }
    }

    return foundItem;
}

export function isValidNumber(value: any): boolean {
    validateNotNull(value);

    const valueStr = ' ' + value;
    const hasDecimal = valueStr.indexOf('.') > -1 ;
    // tslint:disable-next-line:radix
    const numberValue = hasDecimal ?  Number.parseFloat(value) : Number.parseInt(value);
    const isNumber = Number.isNaN(numberValue);

    return isNumber;
}

// https://devhints.io/moment
export const momentFormat = 'MM/DD/YYYY';
export function isValidDate(item: string): boolean {
    validateStringNotEmpty(item);
    const date = moment(item, momentFormat);
    const momentValid = moment.isDate(date);

    return momentValid;
}

export function isValidTime(item: string): boolean {
    validateStringNotEmpty(item);

    const format = 'hh:mm:ss a';
    const time = moment(item, format);
    const momentValid = moment.isDate(time);

    return momentValid;
}

export function isValidDateTime(item: string): boolean {
    validateStringNotEmpty(item);
    const matchArr = /\b(\d{2}\/\d{2}\/\d{4})\b(\d{2}:\d{2}:\d{2}\b[am|pm|AM|PM]{1})/.exec(item);
    if (matchArr.length !== 3) {
        // tslint:disable-next-line:no-console
        console.trace('utils::isValidDateTime() - Invalid date time format: ' + item);
        return false;
    }

    const datePart = matchArr[1];
    const timePart = matchArr[2];

    const timeValid = isValidTime(timePart);
    const dateValid = isValidDate(datePart);

    return dateValid && timeValid;
}

export function convertDateToMoment(date: Date): moment.Moment {
    const dateMoment = moment(date, momentFormat);
    return dateMoment;
}

export function formatDateTime(dateTime: Date, format: string = 'YYYY-MM-DD hh:mm:ss a') {
    validateNotNull(dateTime, 'dateTime is required');

    const formattedDateTime = convertDateToMoment(dateTime).format(format);
    return formattedDateTime;
}


export function logMessage(message: any, messageLogLevel: tps.MessageLogLevel = tps.MessageLogLevel.Debug): void {
    if (typeof message !== 'string') {
        message = inspect(message, {showHidden: true, showProxy: true});
    }

    const now = new Date(Date.now());
    const formattedNow = formatDateTime(now, 'hh:mm:ss a');
    message = '[' + formattedNow + '] ' + message;

    switch (messageLogLevel) {
        case tps.MessageLogLevel.Debug:
            console.log(message);
            break;
        case tps.MessageLogLevel.Info:
            console.info(message);
            break;
        case tps.MessageLogLevel.Warn:
            console.warn(message);
            break;
        case tps.MessageLogLevel.Error:
            console.error(message);
            break;
        default:
            throw new Error('coreModule::shared::helper() - Unknown MessageLogLevel: ' + messageLogLevel);
    }
}
