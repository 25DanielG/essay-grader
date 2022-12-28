const DISCOVERY_DOC = [
    'https://docs.googleapis.com/$discovery/rest?version=v1',
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
    'https://www.googleapis.com/discovery/v1/apis/people/v1/rest'
];

const SCOPES = 'https://www.googleapis.com/auth/documents.readonly '
    + 'https://www.googleapis.com/auth/documents '
    + 'https://www.googleapis.com/auth/drive.file '
    + 'https://www.googleapis.com/auth/plus.me '
    + 'https://www.googleapis.com/auth/userinfo.profile'
;

let tokenClient, token, name;
let gapiInited = false;
let gisInited = false;

setTimeout(gapiLoaded, 1000);
setTimeout(gisLoaded, 1000);

document.getElementById('login_button').style.visibility = 'hidden';
document.getElementById('to_portal').style.visibility = 'hidden';

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
    maybeEnableButtons();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if(gapiInited && gisInited) {
        document.getElementById('login_button').style.visibility = 'visible';
        document.getElementById('to_portal').style.visibility = 'visible';
    }
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
    try {
        // Initialize the API client
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOC,
            // clientId: CLIENT_ID,
            // scope: SCOPES,
            // clientSecret: CLIENT_SECRET,
        }).then(function () {
            console.log("Initialized");
        });
        gapiInited = true;
        maybeEnableButtons();
    } catch (error) {
        console.error(error);
        alert("Error initializing gapi.client: " + error.message);
    }
}

async function updateProfileImg() {
    gapi.client.plus.people.get({
        userId: 'me',
    }).then((response) => {
        const profilePictureUrl = response.result.image.url;
        const profilePictureElement = document.querySelector('.profile-picture');
        profilePictureElement.src = profilePictureUrl;
    }, (error) => {
        console.error('Error: ' + error.result.error.message);
    });
}

function handleStudentClick() {
    handleAuthClick('student');
}

function handleTeacherClick() {
    handleAuthClick('teacher');
}

/**
 *  Sign in the user upon button click.
 */
async function handleAuthClick(identity) {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        //await updateProfileImg();
        if(identity == 'student') {
            gapi.client.people.people.get({
                resourceName: 'people/me',
                personFields: 'names',
            }).then((res) => {
                name = res.result.names[0].displayName;
            }).then(() => {
                const data = new URLSearchParams();
                data.append('name', name);
                data.append('token', gapi.client.getToken().access_token);
                fetch('/', {
                    method: 'POST',
                    body: data
                })
                .then(response => {
                    if(response.ok) {
                        window.location.href = response.url;
                    }
                })
                .catch(error => console.error(error))
            });
        } else {
            window.location.href = `http://localhost:2020/teacher?token=${gapi.client.getToken().access_token}`;
        }
    };
    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        tokenClient.requestAccessToken({prompt: ''});
    }
}