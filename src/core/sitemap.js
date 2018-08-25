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

export const LOGIN = `${config.proxy_protocol}://${config.proxy_api_host}:${config.proxy_api_port}/${config.restApiRoot}/Users/login`;
