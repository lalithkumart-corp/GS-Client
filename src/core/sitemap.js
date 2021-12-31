let app = require('./app');
let env = require('./environment');
// let config;

// if(app.env === env.DEVELOPMENT) {
//     config = {        
//         "proxy_api_host": window.location.hostname || "localhost",
//         "proxy_api_port": 3003,
//         "proxy_protocol": "http",
//         "restApiRoot": "api"
//     }
// } else if (app.env === env.PRODUCTION) {
//     config = {        
//         "proxy_api_host": window.location.hostname || "localhost",
//         "proxy_api_port": 3003,
//         "proxy_protocol": "http",
//         "restApiRoot": "api"
//     }
// }
if(process.env.REACT_APP_ENV == 'offlineprod') {
    window.console = {
        log: () => {},
        error: () => {},
        warn: () => {},
    }
}


console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT ENV File:', process.env.REACT_APP_ENV);

let port;
if(window.location.protocol == "https:")
    port = 443;
else
    port = 80;
// port = window.location.port || process.env.REACT_APP_API_PORT;

let hostName = process.env.REACT_APP_API_HOST;

if(process.env.REACT_APP_ENV == 'development' || process.env.REACT_APP_ENV == "offlineprod") {
    port = process.env.REACT_APP_API_PORT;
    hostName = window.location.hostname;// process.env.REACT_APP_API_HOST
}

const protocol = window.location.protocol.substring(0, window.location.protocol.indexOf(':')) || process.env.REACT_APP_API_PROTOCOL;

export let config = {
    "proxy_api_host": hostName,
    "proxy_api_port": port,
    "proxy_protocol": protocol,
    "restApiRoot": process.env.REACT_APP_API_ROOT,
    "assetsRoot": process.env.REACT_APP_SERVER_ASSETS_ROOT || '',
};

console.log(config);

export const SERVER_URL = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}`;
export const SERVER_ASSETS_URL_PATH = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}${config.assetsRoot}`;
export const LOGIN = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/GsUsers/login-user`;
export const SSO_LOGIN = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/GsUsers/sso-login`;
export const CHECK_EMAIL_EXISTANCE = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/GsUsers/check-email-existance`;
export const RESET_PWD = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/GsUsers/password-reset`;

export const GET_APP_STATUS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/AppManagers/get-status`;
export const CHECK_USED_TRIAL_OFFER = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/AppManagers/check-used-trial-offer`;
export const UPDATE_APP_STATUS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/AppManagers/update-status`;
export const FETCH_USER_PREFERENCES = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/UserPreferences/get-user-preferences`;
export const LOGOUT = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/GsUsers/logout-user`;
export const ADD_CUSTOMER = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/GsUsers/add-customer`;
export const ADD_USER = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/GsUsers/add-user`;
export const USERS_LIST = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/GsUsers/user-list`;
export const UPDATE_USER_PREFERENCES = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/UserPreferences/update-user-preference`;
export const PLEDGEBOOK_METADATA = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Customers/metadata`;
export const FETCH_CUSTOMERS_BASIC_LIST = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Customers/customer-basic-list`;
export const PLEDGEBOOK_ADD_RECORD = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Pledgebooks/add-new-billrecord`;
export const PLEDGEBOOK_UPDATE_RECORD = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Pledgebooks/update-billrecord`;
export const PLEDGEBOOK_FETCH_CUSTOMER_HISTORY = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Pledgebooks/fetch-customer-history`;
export const GET_LAST_BILL_NO = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/PledgebookSettings/get-last-bill-series-and-number`;
export const UPDATE_BILL_NO_SETTINGS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/PledgebookSettings/update-bill-series-and-number`;
export const GET_PENDING_BILLS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Pledgebooks/get-pending-bills`;
export const REDEEM_PENDING_BILLS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Pledgebooks/redeem-pending-bills`;
export const REOPEN_CLOSED_BILL = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Pledgebooks/re-open-closed-bills`;
export const GET_PENDING_BILL_NOS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Pledgebooks/get-pending-bill-nos`;
export const GET_BILL_DETAILS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Pledgebooks/get-bill-details`;
export const PLEDGEBOOK_EXPORT = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Pledgebooks/export-pledgebook`;
export const ARCHIVE_PLEDGEBOOK_BILLS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Pledgebooks/archive-bills`;
export const UNARCHIVE_PLEDGEBOOK_BILLS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Pledgebooks/un-archive-bills`;
export const TRASH_PLEDGEBOOK_BILLS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Pledgebooks/trash-bills`;
export const RESTORE_TRASHED_PLEDGEBOOK_BILLS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Pledgebooks/restore-trashed-bills`;
export const PERMANENTLY_DELETE_PLEDGEBOOK_BILLS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Pledgebooks/delete-bills`;
export const ADD_NEW_INTEREST_RATE = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Interests/add-new-interest-rate`;
export const GET_INTEREST_RATES = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Interests/get-interest-rates`;
export const DELETE_INTEREST_RATE = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Interests/del-interest-rate`;
export const UPDATE_CUSTOMER_DETAIL = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Customers/update-customer-detail`;
export const SAVE_BASE64_IMAGE_AND_GET_ID = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Images/save-base64-and-get-id`;
export const SAVE_BINARY_IMAGE_AND_GET_ID = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Images/save-binary-and-get-id`;
export const DEL_IMAGE_BY_ID = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Images/del-by-id`;
export const FETCH_NOTES = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Notes/fetch-notes`;
export const ORNAMENT_LIST = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Ornaments/fetch-list`;
export const UPDATE_ORN = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Ornaments/update-item`;
export const INSERT_NEW_ORN = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Ornaments/create`;
export const DELETE_ORN = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Ornaments/delete`;
//export const GET_INTEREST_RATES = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Interests/fetch-rate-of-interest-details`;
export const UPDATE_INTEREST_RATES = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Interests/update-rate-of-interest-details`;
export const EXPORT_FULL_DB = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Commons/export-db`;
export const CREATE_NEW_CUSTOMER = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Customers/create-new`;
export const UPDATE_CUSTOMER_BY_MERGING = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Customers/update-by-merging`;
export const UPDATE_CUSTOMER_STATUS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Customers/update-status`;
export const FETCH_ROLES_LIST = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/GsRoles/fetch-list`;

export const INSERT_NEW_ORN_JEWELLERY = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/JewellryOrnaments/create-new-orn`;
export const UPDATE_ORN_JEWELLERY = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/JewellryOrnaments/update-orn`;
export const DELETE_ORN_JEWELLERY = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/JewellryOrnaments/delete-orn`;
export const FETCH_ORN_LIST_JEWELLERY = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/JewellryOrnaments/fetch-orn-list`;
export const FETCH_STOCK_LIST = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Stocks/fetch-list`;
export const FETCH_STOCK_TOTALS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Stocks/fetch-totals`;
export const FETCH_STOCK_SOLD_OUT_LIST = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Stocks/fetch-sold-out-item-list`;
export const FETCH_STOCK_SOLD_ITEM_TOTALS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Stocks/fetch-sold-out-item-total`;
export const FETCH_PROD_IDS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Stocks/fetch-product-ids`;
export const INSERT_NEW_STOCK_ITEM = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Stocks/insert`;
export const UPDATE_STOCK_ITEM = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Stocks/update-item`;
export const FETCH_STOCKS_BY_PRODID = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Stocks/fetch-by-prod-id`;
export const FETCH_TOUCH_LIST = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Touches/list`;
export const SALE_ITEM = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Stocks/sell-item`;
export const GET_STORE_INFO = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Stores/get-info`;
export const UPDATE_STORE_INFO = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Stores/update-info`;
export const CREATE_NEW_ALERT = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Alerts/create-new`;
export const UPDATE_ALERT = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Alerts/update-alert`;
export const DELETE_ALERT = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Alerts/delete-alert`;
export const GET_ALERTS_LIST = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Alerts/get-alerts-list`;
export const ARCHIVE_AN_ALERT = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Alerts/archive-an-alert`;
export const GET_USERID_BY_TOKEN = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/user-id-by-token`;

export const FETCH_CATEGORY_SUGGESTIONS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/FundTransactions/fetch-category-suggestions`;
export const CASH_IN = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/FundTransactions/cash-in`;
export const CASH_IN_FOR_BILL = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/FundTransactions/cash-in-for-bill`;
export const CASH_OUT = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/FundTransactions/cash-out`;
export const UPDATE_TRANSACTION_CASH_IN = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/FundTransactions/update-cash-in`;
export const UPDATE_TRANSACTION_CASH_OUT = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/FundTransactions/update-cash-out`;
export const GET_FUND_TRN_LIST = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/FundTransactions/fetch-transactions-v2`;
export const GET_FUND_TRN_OVERVIEW = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/FundTransactions/fetch-transactions-overview`;
export const GET_FUND_TRN_LIST_BY_BILL = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/FundTransactions/fetch-transactions-by-bill`;
export const DELETE_FUND_TRANSACTION = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/FundTransactions/delete-by-transactionid`;
export const GET_OPENING_BALANCE = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/FundTransactions/get-opening-balance`;

export const ADD_TAGS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Commons/add-tag`;
export const REMOVE_TAGS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Commons/remove-tag`;

export const GET_LOAN_BILL_TEMPLATE_SETTINGS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/LoanBillTemplates/get-settings`;
export const UPDATE_LOAN_BILL_TEMPLATE = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/LoanBillTemplates/update-settings`;
export const FETCH_AVL_LOAN_BILL_TEMPLATES = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/LoanBillTemplates/fetch-avl-loan-bill-templates`;

export const GET_JEWELLERY_BILL_SETTINGS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/JewelleryBillSettings/get-settings`;
export const UPDATE_JEWELLERY_BILL_SETTINGS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/JewelleryBillSettings/update-settings`;
export const FETCH_AVL_JEWELLERY_BILL_TEMPLATES = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/JewelleryBillSettings/fetch-avl-jewellery-bill-templates`;

export const SAVE_INVOICE_DATA = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/JewelleryInvoices/save-invoice`;
export const FETCH_INVOICE_DATA = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/JewelleryInvoices/get-invoice-data`;

export const FETCH_FUND_ACCOUNTS_LIST = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/FundAccounts/get-list`;
export const ADD_NEW_FUND_ACCOUNT = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/FundAccounts/insert-account`;
export const UPDATE_FUND_ACCOUNT = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/FundAccounts/update-account`;
export const DELETE_FUND_ACCOUNT = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/FundAccounts/delete-account`;
export const FETCH_ALL_BANK_LIST = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Commons/fetch-bank-list`;

export const CREATE_UDHAAR = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Udhaars/create-udhaar`;
export const UPDATE_UDHAAR = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Udhaars/update-udhaar`;
export const FETCH_UDHAAR_LIST = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Udhaars/get-pending-udhaar-bills`;
export const FETCH_UDHAAR_DETAIL = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Udhaars/get-udhaar-detail`;
export const FETCH_CUSTOMER_UDHAAR_HISTORY = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Udhaars/fetch-customer-history`;
export const GET_LAST_UDHAAR_SERIAL_NO = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/UdhaarSettings/get-next-serial-no`;
export const MARK_RESOLVED_BY_PAYMENT_CLEARANCE = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Udhaars/mark-resolved-by-payment-clearance`;
export const LAL_M_AD_129 = 'GS_MAK_INTERLAL_M_AD_129_VALGS_MAK_INTER';
export const SAVE_LOCATION = `${config.proxy_protocol}://trsoftware.in/${config.restApiRoot}/Commons/save-location`;
