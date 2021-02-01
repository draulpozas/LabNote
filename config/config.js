process.env.PORT = process.env.PORT || 3000;
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

let connUrl;

if (process.env.NODE_ENV === 'dev') {
    connUrl = 'mongodb://localhost:27017/labnote';
} else {
    connUrl = ''; // rellenar aquí al desplegar
}

process.env.CONN_URL = connUrl;