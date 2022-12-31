function deleteEssay() {
    fetch(`/api/del/${document.querySelector('.id').value}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    });
    window.location.href = '/';
}

function postComments() {
    let comments = document.querySelector('.entered_comments').value;
    if(comments.trim() === '')
        return;
    fetch(`/api/comments/${document.querySelector('.id').value}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: {
            comments: comments
        }
    });
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
    await embedDoc();
};

async function embedDoc() {
    const embedUrl = `https://docs.google.com/document/d/${document.querySelector('.document_id').value}/preview`;
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.width = 735;
    iframe.height = 550;
    iframe.className = 'docs_embed'
    document.querySelector('.text_div').appendChild(iframe);
}

function toggleSidebar() {
    document.getElementById('sidenav').classList.toggle('sidebar-open');
}