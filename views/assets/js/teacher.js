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

setTimeout(gapiLoaded, 1000);
setTimeout(gisLoaded, 1000);

let limit = true;

function addListOption() {
    let list_div = document.querySelector('.list');
    list_div.innerHTML = list_div.innerHTML + ''
        + '<a href="google.com">'
        + '    <div class="list_item">'
        + '        <h2>Manual Essay</h2>'
        + '    </div>'
        + '</a>'
    ;
}

function redirectToView(id) {
    if(id.trim() == '')
        return;
    let class_name = "redirect_view_" + id;
    document.querySelector(`.${class_name}`).submit();
}

window.onload = async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    token = urlParams.get('token').replaceAll('%22', '');
    await gapi.client.setToken({
        access_token: token
    });
};

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '',
    });
}

async function initializeGapiClient() {
    if(!limit) return;
    limit = false;
    try {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOC,
        }).then(async function () {
            console.log("Initialized");
            await updateProfileImg();
        });
    } catch (error) {
        console.log("Error initializing gapi.client: " + error.message);
        alert("Your Google Access Token has expired. Please log in again.");
    }
}

async function updateProfileImg() {
    await gapi.client.people.people.get({
        resourceName: 'people/me',
        personFields: 'photos'
    }).then(function(response) {
        let profilePictureUrl = response.result.photos[0].url;
        document.querySelector('.profile-picture').src = profilePictureUrl;
    });
}

function deleteEssay(essayId) {
    fetch(`/api/del/${essayId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    });
    setTimeout(window.location.reload(), 1000);
}