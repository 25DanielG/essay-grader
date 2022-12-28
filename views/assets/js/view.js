async function deleteEssay() {
    document.querySelector('.essay_del').submit();
};
function postComments() {
    let comments = document.querySelector('.entered_comments').value;
    if(comments.trim() === '')
        return;
    console.log("Submitted comment post request: " + comments);
    document.querySelector('.add_com').submit();
}
function toggleCom() {

}
function toggleIncor() {
    document.querySelectorAll('.incor_info').forEach((element) => {
        if(element.getAttribute('style').includes('none')) {
            element.setAttribute('style', 'display: block');
            document.querySelector('.expand_incor').innerHTML = ''
              +  '<i class="material-icons" style="font-size: 14px;">arrow_drop_up</i>'
              +  'Hide Incorrect';
        } else {
            element.setAttribute('style', 'display: none');
            document.querySelector('.expand_incor').innerHTML = ''
              +  '<i class="material-icons" style="font-size: 14px;">arrow_drop_down</i>'
              +  'Show Incorrect';
        }
    })
}
window.onload = async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let id = urlParams.get('id').replaceAll('%22', '');
    documentId = urlParams.get('document_id').replaceAll('%22', '');
    await embedDoc();
    let inputs = document.querySelectorAll('.id');
    inputs.forEach((input) => {
        input.value = id;
    });
};

let documentId;

async function embedDoc() {
    const embedUrl = `https://docs.google.com/document/d/${documentId}/preview`;
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.width = 735;
    iframe.height = 550;
    iframe.className = 'docs_embed'
    document.querySelector('.text_div').appendChild(iframe);
}