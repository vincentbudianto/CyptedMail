require('dotenv').config()

// load the things we need
const express = require('express');
const { google } = require('googleapis');
const session = require('express-session');
const app = express();
const port = 8000;
const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URIS
);
const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send'
];

//Set param ECDSA for signature
let p = BigInt(6277101735386680763835789423207666416083908700390324961279n)
let n = BigInt(6277101735386680763835789423176059013767194773182842284081n)
let a = BigInt(-3n)
let b = BigInt(2455155546008943817740293915197451784769108058161191238065n)
let g = [BigInt(602046282375688656758213480587526111916698976636884684818n),
        BigInt(174050332293622031404857552280219410364023488927386650641n)]

// From meyer with <3
let blockCipher = require('./BlockCipher')
let ecdsa = require('./ECDSA')

// Static file
app.use('/js', express.static(__dirname + '/js'))
app.use('/css', express.static(__dirname + '/css'))
app.use('/bootstrap', express.static(__dirname + '/bootstrap'))
app.use('/font-awesome', express.static(__dirname + '/font-awesome'))

// Setup session
app.use(session({
    // It holds the secret key for session
    secret: "secretofVB",

    // Forces the session to be saved
    // back to the session store
    resave: true,

    // Forces a session that is "uninitialized"
    // to be saved to the store
    saveUninitialized: false,

    // Session expires in 4 Hours
    cookie: {
        maxAge: 14400000
    }
}))

// set the view engine to ejs
app.set('view engine', 'ejs');

app.listen(port, () => {
    console.log(`App run on port : ${port}`)
});

app.get('', (req, res) => {
    if (req.session.token !== undefined) {
        res.render('index',
        {
            app_url: process.env.APP_URL,
            token: req.session.token,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET
        })
    } else {
        res.redirect("/sign")
    }
})

app.get('/sign', (req, res) => {
    if (req.session.token !== undefined) {
        res.redirect('/')
    } else {
        res.render('signIn',
        {
            app_url: process.env.APP_URL,
            client_id: process.env.CLIENT_ID
        })
    }
})

app.get('/signin', (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });

    res.redirect(authUrl)
})

app.get('/signed', (req, res) => {
    code = req.query.code
    oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        req.session.token = token;
        res.redirect('/inbox')
    });
})

app.get('/logout', (req, res) => {
    req.session.destroy(function(error){
        console.log("Session Destroyed")
        res.redirect('/sign')
    })
})

app.get('/inbox', (req, res) => {
    const gmail = google.gmail({version: 'v1', auth: oAuth2Client});
    let pageToken = ''

    gmail.users.messages.list({
        userId: 'me',
        labelIds: 'INBOX',
        pageToken: pageToken,
        includeSpamTrash: true,
        q: '',
        maxResults: 10
    }, (err, messageList) => {
        if (err) return console.log('The API 1 returned an error: ' + err);
        const messages = messageList.data.messages;
        const nextToken = messageList.data.nextPageToken;

        if (messages.length) {
            let result = []

            messages.forEach((message) => {
                // console.log('message :', message)
                gmail.users.messages.get({
                    'userId': 'me',
                    'id': message.id
                }, (err, message) => {
                    if (err) console.log('The API 2 returned an error: ' + err);
                    // console.log(message.data.payload.headers);

                    let data = {
                        'id': message.data.id,
                        'from': message.data.payload.headers.find(x => x.name === "From").value,
                        'subject': message.data.payload.headers.find(x => x.name === "Subject").value.replace(/[^a-zA-Z0-9:']/g, " "),
                        'date': new Date(Number(message.data.internalDate) / 1000)
                    };

                    result.push(data);

                    if (result.length == messages.length) {
                        // console.log('------------------------');
                        // console.log('result :');
                        // console.log(result);
                        res.render('index', {
                            result: result,
                            app_url: process.env.APP_URL,
                            token: req.session.token,
                            client_id: process.env.CLIENT_ID,
                            client_secret: process.env.CLIENT_SECRET
                        })
                        // res.redirect('/inbox/' + nextToken)
                    }
                })
            });
        } else {
            console.log('Inbox empty.');
        }
    });
})

app.get('/sent', (req, res) => {
    const gmail = google.gmail({version: 'v1', auth: oAuth2Client});
    let pageToken = ''

    gmail.users.messages.list({
        userId: 'me',
        labelIds: 'SENT',
        pageToken: pageToken,
        includeSpamTrash: true,
        q: '',
        maxResults: 10
    }, (err, messageList) => {
        if (err) return console.log('The API 1 returned an error: ' + err);
        const messages = messageList.data.messages;
        const nextToken = messageList.data.nextPageToken;

        if (messages.length) {
            let result = []

            messages.forEach((message) => {
                // console.log('message :', message)
                gmail.users.messages.get({
                    'userId': 'me',
                    'id': message.id
                }, (err, message) => {
                    if (err) console.log('The API 2 returned an error: ' + err);
                    // console.log(message.data.payload.headers);

                    let data = {
                        'id': message.data.id,
                        'from': message.data.payload.headers.find(x => x.name === "From").value,
                        'subject': message.data.payload.headers.find(x => x.name === "Subject").value.replace(/[^a-zA-Z0-9:']/g, " "),
                        'date': new Date(Number(message.data.internalDate) / 1000)
                    };

                    result.push(data);

                    if (result.length == messages.length) {
                        // console.log('------------------------');
                        // console.log('result :');
                        // console.log(result);
                        res.render('index', {
                            result: result,
                            app_url: process.env.APP_URL,
                            token: req.session.token,
                            client_id: process.env.CLIENT_ID,
                            client_secret: process.env.CLIENT_SECRET
                        })
                        // res.redirect('/inbox/' + nextToken)
                    }
                })
            });
        } else {
            console.log('Sent empty.');
        }
    });
})

app.get('/spam', (req, res) => {
    const gmail = google.gmail({version: 'v1', auth: oAuth2Client});
    let pageToken = ''

    gmail.users.messages.list({
        userId: 'me',
        labelIds: 'SPAM',
        pageToken: pageToken,
        includeSpamTrash: true,
        q: '',
        maxResults: 10
    }, (err, messageList) => {
        if (err) return console.log('The API 1 returned an error: ' + err);
        const messages = messageList.data.messages;
        const nextToken = messageList.data.nextPageToken;

        if (messages.length) {
            let result = []

            messages.forEach((message) => {
                // console.log('message :', message)
                gmail.users.messages.get({
                    'userId': 'me',
                    'id': message.id
                }, (err, message) => {
                    if (err) console.log('The API 2 returned an error: ' + err);
                    // console.log(message.data.payload.headers);

                    let data = {
                        'id': message.data.id,
                        'from': message.data.payload.headers.find(x => x.name === "From").value,
                        'subject': message.data.payload.headers.find(x => x.name === "Subject").value.replace(/[^a-zA-Z0-9:']/g, " "),
                        'date': new Date(Number(message.data.internalDate) / 1000)
                    };

                    result.push(data);

                    if (result.length == messages.length) {
                        // console.log('------------------------');
                        // console.log('result :');
                        // console.log(result);
                        res.render('index', {
                            result: result,
                            app_url: process.env.APP_URL,
                            token: req.session.token,
                            client_id: process.env.CLIENT_ID,
                            client_secret: process.env.CLIENT_SECRET
                        })
                        // res.redirect('/inbox/' + nextToken)
                    }
                })
            });
        } else {
            console.log('Inbox empty.');
        }
    });
})

app.get('/trash', (req, res) => {
    const gmail = google.gmail({version: 'v1', auth: oAuth2Client});
    let pageToken = ''

    gmail.users.messages.list({
        userId: 'me',
        labelIds: 'TRASH',
        pageToken: pageToken,
        includeSpamTrash: true,
        q: '',
        maxResults: 10
    }, (err, messageList) => {
        if (err) return console.log('The API 1 returned an error: ' + err);
        const messages = messageList.data.messages;
        const nextToken = messageList.data.nextPageToken;

        if (messages.length) {
            let result = []

            messages.forEach((message) => {
                // console.log('message :', message)
                gmail.users.messages.get({
                    'userId': 'me',
                    'id': message.id
                }, (err, message) => {
                    if (err) console.log('The API 2 returned an error: ' + err);
                    // console.log(message.data.payload.headers);

                    let data = {
                        'id': message.data.id,
                        'from': message.data.payload.headers.find(x => x.name === "From").value,
                        'subject': message.data.payload.headers.find(x => x.name === "Subject").value.replace(/[^a-zA-Z0-9:']/g, " "),
                        'date': new Date(Number(message.data.internalDate) / 1000)
                    };

                    result.push(data);

                    if (result.length == messages.length) {
                        // console.log('------------------------');
                        // console.log('result :');
                        // console.log(result);
                        res.render('index', {
                            result: result,
                            app_url: process.env.APP_URL,
                            token: req.session.token,
                            client_id: process.env.CLIENT_ID,
                            client_secret: process.env.CLIENT_SECRET
                        })
                        // res.redirect('/inbox/' + nextToken)
                    }
                })
            });
        } else {
            console.log('Inbox empty.');
        }
    });
})

app.post('/new-email', async (req, res) => {
    let data = req.body
    if (data.targetEmail == undefined ||
        data.newSubject == undefined ||
        data.newMessage == undefined) {
        res.redirect('/');
    }
    let message = data.newMessage
    console.log(message);
    if (data.signed) {
        let ecdsa_code = new ecdsa.ECDSA(a, b, p, g, n);
        let publickey = data.newECDSAPublicKey;
        let privatekey = data.newECDSAPrivateKey;
        if (publickey && privatekey) {
            ecdsa_code.setPrivatekeyHex(privatekey);
            ecdsa_code.setPublicKeyHex(publickey);

            signature = ecdsa_code.sign(message, ecdsa_code.privateKeyHex, hexedKey = true, hexedOutput = true);
            console.log('Signature =', signature);

            message = message + '\n' + signature;
        } else {
            res.redirect('/');
        }
    }

    if (data.encrypted) {
        let Enckey = data.newCipherKey
        // Encryption
        if (Enckey) {
            await blockCipher.encrypt(data.newMessage, Enckey)
            .then(encrypted => {
                message = encrypted
            })
        } else {
            res.redirect('/')
        }
    }

    // Send message here
    sendEmail = sendEmail(data.newSubject, data.targetEmail, messsage, oAuth2Client)
    res.redirect('/')
})

function sendEmail(subj, email, text, auth) {
    const gmail = google.gmail({version: 'v1', auth: oAuth2Client});

    const subject = subj;
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
        'To: ' + email,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        text
    ];
    const message = messageParts.join('\n');

    // The body needs to be base64url encoded.
    const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: encodedMessage,
        },
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        // const messages = res.data.messages;
        // if (messages.length) {
        //   console.log('Messages:');
        //   messages.forEach((message) => {
        //     console.log(`- ${message.id} | ${message.threadId}`);
        //   });
        // } else {
        console.log('Email sent');
      // }
    });
}