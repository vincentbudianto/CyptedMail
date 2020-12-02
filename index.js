const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.

  /*
    BUAT NYOBA DAPETIN List Label
  */
  // authorize(JSON.parse(content), listLabels);

  /*
    BUAT NYOBA DAPETIN Message
  */
  authorize(JSON.parse(content), getInbox);
  // authorize(JSON.parse(content), getSent);

  /*
    BUAT NYOBA Send Message
  */
  // authorize(JSON.parse(content), sendMessage);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.labels.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const labels = res.data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`- ${label.name}`);
      });
    } else {
      console.log('No labels found.');
    }
  });
}

/**
 * Lists the messages in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getInbox(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.messages.list({
    userId: 'me',
    labelIds: 'INBOX',
    maxResults: 1
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const messages = res.data.messages;
    if (messages.length) {
      console.log('Inbox:');
      messages.forEach((message) => {
        gmail.users.messages.get({
          'userId': 'me',
          // 'id': message.id
          'id': '175abd706b1db428'
        }, (err, res) => {
          if (err) return console.log('The API returned an error: ' + err);
          let result = res.data;
          console.log(`- ${result.id} | ${result.threadId}`);
          // console.log('Snippet :', result.snippet);
          // console.log('Headers :', result.payload.headers);
          console.log('Header :', result.payload.headers.find(x => x.name === "Subject").value.replace(/[^a-zA-Z0-9:']/g, " "));
          // data = Buffer.from(result.payload.parts[0].body.data, 'base64');
          // console.log('Message :', data.toString("utf-8"));
          // console.log('Message :', result.payload.parts[0].body.data);
          // console.log('Payload :', result.payload);
          // if (result.payload.parts[1].body.attachmentId !== undefined) {
          //   console.log('Attachment :', result.payload.parts[1].body.attachmentId);
          //   console.log('Type :', result.payload.parts[1].mimeType);
          //   console.log('Filename :', result.payload.parts[1].filename);
          // } else {
          //   console.log('No attachment.')
          // }
          // console.log('Message :', result.payload.parts[1].body.data);
        });
      });
    } else {
      console.log('No labels found.');
    }
  });
}

/**
 * Lists the messages in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getSent(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.messages.list({
    userId: 'me',
    labelIds: 'SENT',
    maxResults: 1
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const messages = res.data.messages;
    if (messages.length) {
      console.log('Inbox:');
      messages.forEach((message) => {
        gmail.users.messages.get({
          'userId': 'me',
          'id': message.id
        }, (err, res) => {
          if (err) return console.log('The API returned an error: ' + err);

          let result = {
              'id': res.data.id,
              'from': res.data.payload.headers.find(x => x.name === "From").value,
              'subject': res.data.payload.headers.find(x => x.name === "Subject").value.replace(/[^a-zA-Z0-9:']/g, " "),
              'date': new Date(Number(res.data.internalDate))
          };

          console.log('Message id :', result.id);
          console.log('From :', result.from);
          console.log('Subject :', result.subject);
          console.log('Date :', typeof(parseInt(res.data.internalDate)));
          console.log('Date :', result.date);
        });
      });
    } else {
      console.log('No labels found.');
    }
  });
}

/**
 * Lists the messages in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function sendMessage(auth) {
  const gmail = google.gmail({version: 'v1', auth});

  const subject = 'TEST GMAIL API';
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const messageParts = [
    'To: willysantoso05@gmail.com',
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    'This is a message just to say hello.',
    'So... <b>Hello!</b>  🤘❤️😎',
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
    console.log('No labels found.');
    // }
  });
}

module.exports = {
  listLabels,
  getInbox,
  getSent
}