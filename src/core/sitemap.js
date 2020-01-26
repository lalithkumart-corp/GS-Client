let app = require('./app');
let env = require('./environment');
let config;

if(app.env === env.DEVELOPMENT) {
    config = {        
        "proxy_api_host": "localhost",
        "proxy_api_port": 3003,
        "proxy_protocol": "http",
        "restApiRoot": "api"
    }
} else if (app.env === env.PRODUCTION) {
    config = {        
        "proxy_api_host": "localhost",
        "proxy_api_port": 3003,
        "proxy_protocol": "http",
        "restApiRoot": "api"
    }
}

export const LOGIN = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/GsUsers/login-user`;
export const LOGOUT = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/GsUsers/logout`;
export const ADD_CUSTOMER = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/GsUsers/add-customer`;
export const ADD_USER = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/GsUsers/add-user`;
export const USERS_LIST = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/GsUsers/user-list`;
export const UPDATE_USER_PREFERENCES = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/UserPreferences/update-user-preference`;
export const PLEDGEBOOK_METADATA = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Customers/metadata`;
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
export const GET_INTEREST_RATES = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Interests/get-interest-rates`;
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
export const UPDATE_CUSTOMER_BY_MERGING = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Customers/update-by-merging`;
export const UPDATE_CUSTOMER_STATUS = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Customers/update-status`;
export const FETCH_ROLES_LIST = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/GsRoles/fetch-list`;