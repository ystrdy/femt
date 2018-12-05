import web from './web';
import client from './client';

export const launch = () => {
    web();
    client();
};

export * from './web';