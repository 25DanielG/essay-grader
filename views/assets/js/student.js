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

async function submitClicked() {
    let essay;
    await gapi.client.docs.documents.get({
        documentId: document.querySelector('.doc_id').value
    }).then(function(response) {
        let doc = response.result;
        let docText = '';
        doc.body.content.forEach(function(block) {
            if (block.paragraph) {
                docText += block.paragraph.elements.map(function(element) {
                    return element.textRun.content;
                }).join('');
            }
        });
        essay = docText;
    });
    let name = document.querySelector('.name').value;
    document.querySelector('.content').value = essay;
    if(essay.trim() == '')
        return;
    document.querySelector('.submission').submit();
}

window.onload = async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    name = urlParams.get('name').replaceAll('%22', '');
    token = urlParams.get('access_token').replaceAll('%22', '');
    if(queryString.includes('document_id')) {
        let id = urlParams.get('document_id').replaceAll('%22', '');
        document.querySelector('.doc_id').value = id;
    }
    document.querySelector('.name').value = name;
    await gapi.client.setToken({
        'access_token': token
    });
    await createAndEmbedDoc();
};

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
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
    } catch (error) {
        console.error(error);
        alert("Error initializing gapi.client: " + error.message);
    }
}

async function createAndEmbedDoc() {
    let documentId;
    if(document.querySelector('.doc_id').value.trim() === '') {
        const fileMetadata = {
            'name': 'Essay Doc',
            'mimeType': 'application/vnd.google-apps.document'
        };
        const response = await gapi.client.drive.files.create({
            resource: fileMetadata,
            fields: 'id'
        });
        documentId = response.result.id;
        document.querySelector('.doc_id').value = documentId;
        fetch("/update-id", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: document.querySelector('.name').value,
                docId: documentId
            })
        });
    }
    documentId = document.querySelector('.doc_id').value;
    const embedUrl = `https://docs.google.com/document/d/${documentId}/edit?usp=sharing`;
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.width = 735;
    iframe.height = 550;
    iframe.className = 'docs_embed'
    // window.location.href += `&document_id=${documentId}`
    document.querySelector('.front').appendChild(iframe);
}