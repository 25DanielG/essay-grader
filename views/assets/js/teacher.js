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