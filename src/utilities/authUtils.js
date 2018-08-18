import cookie from 'react-cookies';

export let isAuthenticated = () => {
    let isAuthenticated = false;
    let accessToken = cookie.load('accessToken') || '';
    if(accessToken != '')
        isAuthenticated = true;
    return isAuthenticated;
}
