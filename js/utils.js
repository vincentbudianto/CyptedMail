const { google } = require('googleapis');

function nama(){
    const oauth2Client = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URIS
    );

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: process.env.SCOPE
    });

    window.location.href = authUrl;
}