import openSocket from 'socket.io-client';
import { SERVER_URL, GET_USERID_BY_TOKEN } from './core/sitemap';
import { getAccessToken } from './core/storage';
import axiosMiddleware from './core/axios';

let stream;

export default class SocketManager {
    constructor() {

    }
    open() {
        return new Promise((resolve, reject) => {
            console.log(SERVER_URL);
            this.connInst = openSocket(SERVER_URL, {
                reconnection: true,
                reconnectionDelay: 40000,
                reconnectionDelayMax : 41000,
                reconnectionAttempts: 5,
                secure: true
            });
            stream = this.connInst;
            this.connInst.on('connect', () => {
                return resolve(this.connInst);
            });
            this.connInst.on('disconnect', () => {
                // log
            });
            this.connInst.on('connect_timeout', (a) => {
                //log.info({msg:'connect timeout',a: a, time: new Date()});
            });
            this.connInst.on('connect_error', (a) => {
                //log.info({msg: 'connect Error', a: a, time: new Date()});
            });
            this.connInst.on('reconnect', (a) => {
                //log.info({msg: `Reconnected. Attemps: ${a}`, time: new Date()});                    
            });
        });
    }
    async getStream() {
        if(stream)
            return stream;
        else
            return await this.open();
    }
    async registerEvents([...events]) {
        let connInst = await this.getStream();
        let accessToken = getAccessToken();
        let userId = await this.getUserIdByToken(accessToken);
        console.log('-----socketid', connInst.id);
        if(userId)
            connInst.emit('register', {userId, events});
    }
    getUserIdByToken(at) {
        return new Promise( async (resolve, reject) => {
            try {
                let resp = await axiosMiddleware.get(`${GET_USERID_BY_TOKEN}?access_token=${at}`);
                if(resp && resp.data && resp.data.userId)
                    return resolve(resp.data.userId);
                else //TODO: add logger
                    return resolve(null);
            } catch(e) {
                console.log(e); //TODO: add logger
                return resolve(null);
            }
        });
    }
}
