require('dotenv').config()

// load the things we need
const express = require('express');
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
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

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(fileUpload());

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
        res.redirect('/inbox')
    } else {
        res.redirect("/sign")
    }
})

app.get('/sign', (req, res) => {
    if (req.session.token !== undefined) {
        res.redirect('/inbox')
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

app.post('/decrypt', (req, res) => {
    let key = req.body.key
    let message = req.body.message
    // Decrypt message

    blockCipher.decrypt(message, key)
    .then(decrypted => {
        console.log("DECRYPTED: ")
        console.log(decrypted)
        // alert(decrypted)
        // res.send(decrypted)
        // res.redirect('/inbox')
        res.render('verify', {
            verResult: decrypted
        })
    })
})


app.post('/verify', (req, res) => {
    console.log(req.body)
    let key = req.body.key
    let message = req.body.message
    let ecdsa_code = new ecdsa.ECDSA(a, b, p, g, n);

    try{
        text = message.split("-----BEGIN_PGP_SIGNATURE-----");
        initial_message = text[0];
        console.log(`message: ${initial_message}`)

        //Parse message
        console.log('text[1]', text[1])
        signature = text[1].split("-----END_PGP_SIGNATURE-----");
        sign = signature[0]
        console.log(`signature: ${sign}`)

        //Verify Message
        ecdsa_code.setPublicKeyHex(key)
        verify = ecdsa_code.verify(initial_message, sign, ecdsa_code.publicKeyHex, hexedKey = true, hexedSign = true)
        console.log(verify)
        // alert(decrypted)
        // res.send(decrypted)
        // res.redirect('/inbox')
        res.render('verify', {
            verResult: verify
        })
        // res.send(verify)
    }catch(err){
        console.log(err)
        res.send(false)
    }
})

app.get('/inbox', (req, res) => {
    if (req.session.token !== undefined) {
        const gmail = google.gmail({version: 'v1', auth: oAuth2Client});
        let pageToken = ''

        gmail.users.messages.list({
            userId: 'me',
            labelIds: 'INBOX',
            pageToken: pageToken,
            includeSpamTrash: true,
            q: '',
            maxResults: 100
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

                        if (message.data.payload.parts !== undefined) {
                            if (message.data.payload.parts[1].body.attachmentId !== undefined) {
                                // console.log('Attachment :', message.data.payload.parts[1]);
                                attachmentId = message.data.payload.parts[1].body.attachmentId
                                // console.log('Attachment found');
                            } else {
                                attachmentId = ''
                                // console.log('No attachment.')
                            }
                        } else {
                            attachmentId = ''
                            // console.log('No attachment.')
                        }

                        let data = {
                            'id': message.data.id,
                            'from': message.data.payload.headers.find(x => x.name === "From").value,
                            'subject': message.data.payload.headers.find(x => x.name === "Subject").value.replace(/[^a-zA-Z0-9:']/g, " "),
                            'date': new Date(Number(message.data.internalDate)),
                            'attachmentId': attachmentId
                        };

                        result.push(data);

                        if (result.length == messages.length) {
                            result.sort((a, b) => b.date - a.date)
                            // console.log('------------------------');
                            // console.log('result :');
                            // console.log(result);
                            res.render('index', {
                                inboxType: 'INBOX',
                                result: result,
                                app_url: process.env.APP_URL,
                                token: req.session.token,
                                client_id: process.env.CLIENT_ID,
                                client_secret: process.env.CLIENT_SECRET
                            })
                        }
                    })
                });
            } else {
                console.log('Inbox empty.');
            }
        });
    } else {
        res.redirect("/sign")
    }
})

app.get('/sent', (req, res) => {
    if (req.session.token !== undefined) {
        const gmail = google.gmail({version: 'v1', auth: oAuth2Client});
        let pageToken = ''

        gmail.users.messages.list({
            userId: 'me',
            labelIds: 'SENT',
            pageToken: pageToken,
            includeSpamTrash: true,
            q: '',
            maxResults: 100
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

                        if (message.data.payload.parts !== undefined) {
                            if (message.data.payload.parts[1].body.attachmentId !== undefined) {
                                // console.log('Attachment :', message.data.payload.parts[1]);
                                attachmentId = message.data.payload.parts[1].body.attachmentId
                                // console.log('Attachment found');
                            } else {
                                attachmentId = ''
                                // console.log('No attachment.')
                            }
                        } else {
                            attachmentId = ''
                            // console.log('No attachment.')
                        }

                        let data = {
                            'id': message.data.id,
                            'from': message.data.payload.headers.find(x => x.name === "From").value,
                            'subject': message.data.payload.headers.find(x => x.name === "Subject").value.replace(/[^a-zA-Z0-9:']/g, " "),
                            'date': new Date(Number(message.data.internalDate)),
                            'attachmentId': attachmentId
                        };

                        result.push(data);

                        if (result.length == messages.length) {
                            result.sort((a, b) => b.date - a.date)
                            // console.log('------------------------');
                            // console.log('result :');
                            // console.log(result);
                            res.render('index', {
                                inboxType: 'SENT',
                                result: result,
                                app_url: process.env.APP_URL,
                                token: req.session.token,
                                client_id: process.env.CLIENT_ID,
                                client_secret: process.env.CLIENT_SECRET
                            })
                        }
                    })
                });
            } else {
                console.log('Sent Email empty.');
            }
        });
    } else {
        res.redirect("/sign")
    }
})

app.get('/spam', (req, res) => {
    if (req.session.token !== undefined) {
        const gmail = google.gmail({version: 'v1', auth: oAuth2Client});
        let pageToken = ''

        gmail.users.messages.list({
            userId: 'me',
            labelIds: 'SPAM',
            pageToken: pageToken,
            includeSpamTrash: true,
            q: '',
            maxResults: 100
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

                        if (message.data.payload.parts !== undefined) {
                            if (message.data.payload.parts[1].body.attachmentId !== undefined) {
                                // console.log('Attachment :', message.data.payload.parts[1]);
                                attachmentId = message.data.payload.parts[1].body.attachmentId
                                // console.log('Attachment found');
                            } else {
                                attachmentId = ''
                                // console.log('No attachment.')
                            }
                        } else {
                            attachmentId = ''
                            // console.log('No attachment.')
                        }

                        let data = {
                            'id': message.data.id,
                            'from': message.data.payload.headers.find(x => x.name === "From").value,
                            'subject': message.data.payload.headers.find(x => x.name === "Subject").value.replace(/[^a-zA-Z0-9:']/g, " "),
                            'date': new Date(Number(message.data.internalDate)),
                            'attachmentId': attachmentId
                        };

                        result.push(data);

                        if (result.length == messages.length) {
                            result.sort((a, b) => b.date - a.date)
                            // console.log('------------------------');
                            // console.log('result :');
                            // console.log(result);
                            res.render('index', {
                                inboxType: 'SPAM',
                                result: result,
                                app_url: process.env.APP_URL,
                                token: req.session.token,
                                client_id: process.env.CLIENT_ID,
                                client_secret: process.env.CLIENT_SECRET
                            })
                        }
                    })
                });
            } else {
                console.log('Spam empty.');
            }
        });
    } else {
        res.redirect("/sign")
    }
})

app.get('/trash', (req, res) => {
    if (req.session.token !== undefined) {
        const gmail = google.gmail({version: 'v1', auth: oAuth2Client});
        let pageToken = ''

        gmail.users.messages.list({
            userId: 'me',
            labelIds: 'TRASH',
            pageToken: pageToken,
            includeSpamTrash: true,
            q: '',
            maxResults: 100
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

                        if (message.data.payload.parts !== undefined) {
                            if (message.data.payload.parts[1].body.attachmentId !== undefined) {
                                // console.log('Attachment :', message.data.payload.parts[1]);
                                attachmentId = message.data.payload.parts[1].body.attachmentId
                                // console.log('Attachment found');
                            } else {
                                attachmentId = ''
                                // console.log('No attachment.')
                            }
                        } else {
                            attachmentId = ''
                            // console.log('No attachment.')
                        }

                        let data = {
                            'id': message.data.id,
                            'from': message.data.payload.headers.find(x => x.name === "From").value,
                            'subject': message.data.payload.headers.find(x => x.name === "Subject").value.replace(/[^a-zA-Z0-9:']/g, " "),
                            'date': new Date(Number(message.data.internalDate)),
                            'attachmentId': attachmentId
                        };

                        result.push(data);

                        if (result.length == messages.length) {
                            result.sort((a, b) => b.date - a.date)

                            res.render('index', {
                                inboxType: 'TRASH',
                                result: result,
                                app_url: process.env.APP_URL,
                                token: req.session.token,
                                client_id: process.env.CLIENT_ID,
                                client_secret: process.env.CLIENT_SECRET
                            })
                        }
                    })
                });
            } else {
                console.log('Trash empty.');
            }
        });
    } else {
        res.redirect("/sign")
    }
})

app.get('/message/:id', async (req, res) => {
    if (req.session.token !== undefined) {
        const gmail = google.gmail({version: 'v1', auth: oAuth2Client});
        gmail.users.messages.get({
            'userId': 'me',
            'id': req.params.id
        }, async (err, message) => {
            if (err) console.log('The API returned an error: ' + err);
            // console.log(message.data.payload.headers);

            let attachment = ''
            if (message.data.payload.parts !== undefined) {
                // console.log(message.data.payload.parts[0])
                // console.log(typeof(message.data.payload.parts[0]))
                if (message.data.payload.parts[0].body.data !== undefined) {
                    body = Buffer.from(message.data.payload.parts[0].body.data, 'base64');
                } else {
                    body = Buffer.from(message.data.payload.parts[0].parts[0].body.data, 'base64');
                }
                // console.log(message.data.payload.parts[0].parts[0].body.data)
                // console.log('Message :', body.toString("utf-8"));

                if (message.data.payload.parts[1].body.attachmentId !== undefined) {
                    // console.log('Attachment :', message.data.payload.parts[1].body.attachmentId);
                    // console.log('Type :', message.data.payload.parts[1].mimeType);
                    // console.log('Filename :', message.data.payload.parts[1].filename);
                    attachmentId = message.data.payload.parts[1].body.attachmentId;
                    type = message.data.payload.parts[1].mimeType;
                    filename = message.data.payload.parts[1].filename;
                    await gmail.users.messages.attachments.get({
                        'userId': 'me',
                        'messageId': req.params.id,
                        'id': attachmentId
                    })
                    .then((response) => {
                        attachment = {
                            'attachmentId': attachmentId,
                            'filename': filename,
                            'type': type,
                            'data': response.data.data
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    })
                } else {
                    // console.log('No attachment.')
                }
            } else {
                body = Buffer.from(message.data.payload.body.data, 'base64');
            }

            // console.log('message 1 :', message.data.payload.parts[0].body.data)
            // console.log('message 2 :', body)
            // console.log('message 3 :', body.toString('utf-8'))
            // console.log('message 4 :', body.toString('ascii'))
            // console.log(attachment.data)

            let result = {
                'id': message.data.id,
                'from': message.data.payload.headers.find(x => x.name === "From").value,
                'to': message.data.payload.headers.find(x => x.name === "To").value,
                'subject': message.data.payload.headers.find(x => x.name === "Subject").value.replace(/[^a-zA-Z0-9:']/g, " "),
                'body': body.toString("utf-8"),
                'date': new Date(Number(message.data.internalDate)),
                'attachment': attachment
            };

            res.render('message', {
                result: result,
                app_url: process.env.APP_URL,
                token: req.session.token,
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET
            })
        })
    } else {
        res.redirect("/sign")
    }
})

app.post('/new-email', async (req, res) => {
    file_attach = true;
    if (!req.files || Object.keys(req.files).length === 0) {
        file_attach = false;
        console.log('No files were uploaded.');
    }

    let files = undefined
    if(file_attach){
        files = req.files.attached_file
    }

    let data = req.body
    if (data.targetEmail == undefined ||
        data.newSubject == undefined ||
        data.newMessage == undefined) {
        res.redirect('/');
    }

    let message = data.newMessage
    if (data.signed) {
        let ecdsa_code = new ecdsa.ECDSA(a, b, p, g, n);
        let publickey = data.newECDSAPublicKey;
        let privatekey = data.newECDSAPrivateKey;
        if (publickey && privatekey) {
            ecdsa_code.setPrivatekeyHex(privatekey);
            ecdsa_code.setPublicKeyHex(publickey);

            signature = ecdsa_code.sign(message, ecdsa_code.privateKeyHex, hexedKey = true, hexedOutput = true);

            message = message + "\n-----BEGIN_PGP_SIGNATURE-----\n" +  signature + "\n-----END_PGP_SIGNATURE-----";
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
    sendingEmail = sendEmail(data.newSubject, data.targetEmail, message, files, oAuth2Client)
    res.redirect('/inbox')
})

function sendEmail(subj, email, text, files, auth) {
    const gmail = google.gmail({version: 'v1', auth: oAuth2Client});

    const subject = subj;
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;

    var messageParts = []
    if(files===undefined){
        messageParts = [
            'To: ' + email,
            'Content-Type: text/html; charset=utf-8',
            'MIME-Version: 1.0',
            `Subject: ${utf8Subject}`,
            '',
            text
        ];
    }else{
        var boundary = "__myapp__";
        var nl = "\n";
        var attach = files.data.toString("base64");
        messageParts = [
            "MIME-Version: 1.0",
            "Content-Transfer-Encoding: 7bit",
            "To: " + email,
            "Subject: " + utf8Subject,
            "Content-Type: multipart/alternate; boundary=" + boundary + nl,
            "--" + boundary,
            "Content-Type: text/plain; charset=UTF-8",
            "Content-Transfer-Encoding: 7bit" + nl,
            text+ nl,
            "--" + boundary,
            "--" + boundary,
            `Content-Type: ${files.mimetype}; name=${files.name}`,
            `Content-Disposition: attachment; filename=${files.name}`,
            "Content-Transfer-Encoding: base64" + nl,
            attach,
            "--" + boundary + "--"
        ]
    }
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
        if (err) {
            return console.log('The API returned an error: ' + err);
        } else {
            console.log('Email sent');
        }
    });
}