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
    document.querySelector('.content').value = essay;
    if(essay.trim() == '')
        return;
    document.querySelector('.submission').submit();
}

window.onload = async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    token = urlParams.get('access_token').replaceAll('%22', '');
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
    try {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOC,
        }).then(async function () {
            console.log("Initialized");
            await createAndEmbedDoc();
        });
    } catch (error) {
        console.error(error);
        alert("Error initializing gapi.client: " + error.message);
    }
}

async function createAndEmbedDoc() {
    let documentId;
    if(!document.querySelector('.doc_id').value.trim()) {
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
        let essayId = document.querySelector('.id').value;
        fetch(`/api/${essayId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
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
    document.querySelector('.front').appendChild(iframe);
    createAndEmbedDoc = function() {};
}