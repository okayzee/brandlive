var app = require('express')();
const cors = require('cors');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const PORT = 8080;

const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}

app.use(cors(corsOptions));

var STATIC_CHANNELS = [{
    name: 'Global chat',
    participants: 0,
    id: 1,
    sockets: []
}, {
    name: 'Funny',
    participants: 0,
    id: 2,
    sockets: []
}];

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    // res.header("Access-Control-Allow-Origin", "http://localhost:3000/"); // update to match the domain you will make the request from
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})


http.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});

io.on('connection', (socket) => { // socket object may be used to send specific messages to the new connected client
    console.log('new client connected');
    socket.emit('connection', null);
    socket.on('channel-join', id => {
        console.log('channel join', id);
        STATIC_CHANNELS.forEach(c => {
            if (c.id === id) {
                if (c.sockets.indexOf(socket.id) == (-1)) {
                    c.sockets.push(socket.id);
                    c.participants++;
                    io.emit('channel', c);
                }
            } else {
                let index = c.sockets.indexOf(socket.id);
                if (index != (-1)) {
                    c.sockets.splice(index, 1);
                    c.participants--;
                    io.emit('channel', c);
                }
            }
        });

        return id;
    });
    socket.on('send-message', message => {
        io.emit('message', message);
    });

    socket.on('disconnect', () => {
        STATIC_CHANNELS.forEach(c => {
            let index = c.sockets.indexOf(socket.id);
            if (index != (-1)) {
                c.sockets.splice(index, 1);
                c.participants--;
                io.emit('channel', c);
            }
        });
    });

});


const socket = require ('socket.io-client' ); 
// version socket-io.client@2.2.0
const connection = socket .connect ('wss://codechallenge.brand.live' );
const channel = 'code-test' ;

connection .on('connect' , () => {
    connection .emit('join-channel' , channel);
    connection .emit('message' , { someMessage: 'This is a test.' }, channel);
});

connection .on('error' , (e) => {
    console .error(e);
});

connection .on('message' , (message) => {
    console .log('MESSAGE RECEIVED' , message);
});

/**
 * @description This methos retirves the static channels
 */
app.get('/getChannels', (req, res) => {
    res.json({
        channels: STATIC_CHANNELS
    })
});