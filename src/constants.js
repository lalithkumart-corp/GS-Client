export const PAYMENT_MODE = {
    1: 'cash',
    2: 'cheque',
    3: 'online'
}
export const PAYMENT_MODE_KEY = {
    'cash': 1,
    'cheque': 2,
    'online': 3
}

export const UPI_INDEX_ID = 19;

export const TAGS = {
    1: 'blue',
    2: 'red',
    3: 'orange',
    4: 'green',
    5: 'cross',
    6: 'tick',
    7: 'doubletick'
}

export const ONE_YEAR_DAYS = 365;
export const LOAN_BILL_EXPIRY_DAYS = ONE_YEAR_DAYS + 7; // 1 year + 7 days
export const LOAN_BILL_EXPIRY_YR = 1;
export const LOAN_BILL_EXPIRY_YEAR_DAY = 7;

export const IN = 'in';
export const OUT = 'out';

export const CASH_TRNS_GIRVI = 'Girvi';

export const DEFAULT_PAYMENT_OBJ_FOR_CASH_OUT = {
    mode: PAYMENT_MODE[1],
    cash: {fromAccountId: ''},
    cheque: {fromAccountId: ''},
    online: {
        fromAccountId: '',
        toAccount: {
            toAccountId: '',
            accNo: '',
            upiId: '',
            ifscCode: ''
        }
    }
}

export const DEFAULT_PAYMENT_OBJ_FOR_CASH_IN = {
    mode: PAYMENT_MODE[1],
    cash: {toAccountId: ''},
    cheque: {toAccountId: ''},
    online: {
        toAccountId: ''
    }
}