document.addEventListener("click", event=> {
    classlist = event.target.classList;
    if (classlist.contains('remove')) {
        remove(event);
    } else if (classlist.contains('reply')) {
        reply(event);
    } else if (classlist.contains('edit-reply')) {
        editReply(event);
    } else if (classlist.contains('yellow')) {
            deleteRespoEstab(event);
    } else if (classlist.contains('del-reply')) {
        deleteReplyfetch(event)
    }
    else if (classlist.contains('chat')) {
        showChat(event)
    } else if (classlist.contains('down')) {
        markDown(event)
    } else if (classlist.contains('up')) {
        markUp(event)
    } else if (classlist.contains('c00000xx') && 
                classlist.contains('editRev')) {
        editReview ()
    }else if (classlist.contains('edit-review')) {
        editText(event)
    } else if (classlist.contains('doneEdit')) {
        doneEditText(event)
    } else if (classlist.contains('estabResponse')) {
        showEstabResponse(event)
    } else if (classlist.contains('reviewtext')) {
        showMoreReadLess(event)
    } else if (classlist.contains('del-review')) {
        deleteCommit (event)
    } else if (classlist.contains('postReview')) {
        if (document.querySelector('input[name="rate"]:checked')== null) {
        if (document.querySelector('.rateEstabText').innerHTML.includes("please input your rating") == false)
            document.querySelector('.rateEstabText').innerHTML += `
            <span class="text-danger fs-6">&nbsp;&nbsp;*please input your rating</span>`
        } else 
        document.querySelector('.rateEstabText').innerHTML = 'Rate this establishment';
    }
 

})

document.addEventListener("submit", event=> {
    event.preventDefault()
    if (classlist.contains('postReview')) {
        document.querySelector('.rateEstabText').innerHTML = 'Rate this establishment';
        insertReview (event)
    } else if (classlist.contains('postReply')) {
        if (classlist.contains('estab'))
            respoEstab(event)
        else {
            replyfetch (event)
        }
    } 
  
})

document.querySelector("#searchForm button").addEventListener("click", (event) => {
    console.log("flag");
    document.querySelector("#searchForm").submit();
})

async function updateHelp (_id, potch) {
    let achievedMilestone = null
    try {
    await fetch('/', {
        method: 'PATCH',
        body: JSON.stringify({
        reviewId: _id,
        updateH: potch
        }),
        headers: {
        'Content-type': 'application/json; charset=UTF-8',
        },
        }).then(async res => {
            switch (res.status) {
                case 200: 
                let data = await res.json()
                if (data.milestone)
                    achievedMilestone = data.milestone
                ; break;
                default:  statusResp(res.status);
            }
        }).catch((err) => console.log(err))
    } catch (err) {
        console.log(err)
    }
    
    return achievedMilestone
}

async function markUp (event) {
    parent = event.target.closest('.REVIEW')
    up = parent.querySelector('.up')
    down = parent.querySelector('.down')
    upvote = parent.querySelector('.uvote')
    downvote = parent.querySelector('.dvote')
    let votes = parseInt(upvote.innerHTML);

    if ($(up).hasClass("upbg")) {
        $(up).addClass('upbgfill').removeClass('upbg') 
        $(upvote).text(votes + 1);
        if ($(down).hasClass("downbgfill")) {
            $(down).addClass('downbg').removeClass('downbgfill')
            $(downvote).text(parseInt($(downvote).text()) - 1);
        }
        potch = "up";
    } else {
        $(up).addClass('upbg').removeClass('upbgfill')
        $(upvote).text(votes - 1);
        potch = "up_";
    }
    
    res = await updateHelp (parent.id, potch) 
    if (res) {
        recipientUserId = await findTheUser (parent.id, "review")
        sendHelpfulNotif (recipientUserId, parent.id, res)
    }
    
}

function sendHelpfulNotif (userId, postId, number) {
    let establishment = document.querySelector('.estabNamez').innerHTML;
    const notifTitle = `look who's cooking.`;
    const notifContent = `${number} users has marked your <a class="text-secondary"href="/${establishment}#${postId}">review</a> helpful`
    sendNotif (userId, notifTitle, notifContent);
}

function markDown (event) {
    parent = event.target.closest('.REVIEW')
    up = parent.querySelector('.up')
    down = parent.querySelector('.down')
    upvote = parent.querySelector('.uvote')
    downvote = parent.querySelector('.dvote')
    let votes = parseInt(downvote.innerHTML);


    if ($(down).hasClass("downbg")) {
        $(down).addClass('downbgfill').removeClass('downbg') 
        $(downvote).text(votes + 1);
        if ($(up).hasClass("upbgfill")) {
            $(up).addClass('upbg').removeClass('upbgfill')
            $(upvote).text(parseInt($(upvote).text()) - 1);
        }
        potch = "down";
    } else {
        $(down).addClass('downbg').removeClass('downbgfill')
        $(downvote).text(votes - 1);
        potch = "down_";
    }
    updateHelp (parent.id, potch)
}

function showChat (event) {
    parent = event.target.closest('.REVIEW')
    targ = parent.querySelector(':scope > .comment')
    if (targ == null) {
        targ = parent.querySelector(':scope .comment')
    } 

    $(targ).collapse('toggle')
}

function reply (event) {
    parent = event.target.closest('.REVIEW')
    replies = parent.querySelector('.wReply')
    $(replies).collapse('toggle') 
}

function showEstabResponse (event) {
    parent = event.target.closest('.REVIEW')
    $(parent.querySelector('.estabResponseText')).collapse('toggle') 
}

async function remove(event) {
    parent = event.target.closest('.REVIEW')
    let establishment = document.querySelector('.estabNamez').innerHTML;
    let userId 
    let deleteReason = ''

    try {
    if (!parent.classList.contains('list-group-item')){
        if (parent.classList.contains('estab')) {
            //estabresponse
            userPoster = parent.parentElement.closest(".REVIEW").querySelector(".user-link").innerHTML;
            deleteReason = `response to <a class="text-secondary"href="/${establishment}#${parent.id}">${userPoster}'s review</a>`
            
            estabID = document.querySelector('.estabIDholder').id
            userId = await findTheUser (estabID, "estabRespo")
        } else {
        //review
        deleteReason = `review to the establishment <a class="text-secondary"href="/${establishment}">${establishment}</a>`
        userId = await findTheUser (parent.id, "review")
        }
    } else {
        //reply
        realParent = parent.parentElement.closest('.REVIEW')
        userPoster = realParent.querySelector(".user-link").innerHTML;
        deleteReason = `reply to <a class="text-secondary"href="/${establishment}#${realParent.id}">${userPoster}'s post</a> in 
        <a class="text-secondary" href="/${establishment}">${establishment}</a>`
        userId = await findTheUser (parent.id, "reply")
    }
    } catch (err) {
        console.log(err)
    }
    
    deleteCommit (event);
    sendDeleteNotif (userId, deleteReason)
}

async function findTheUser (id, type) {
    let userId
    await fetch("/findUser", {
        method: "POST",
        body: JSON.stringify({postId: id, postType: type}),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            },
    }).then(async res => {
        switch (res.status) {
            case 200: 
            let data = await res.json()
            if (data.userId) userId = data.userId;

            break;
            default:  statusResp(res.status); break;
        }
    }).catch((err) => console.log(err))

    return userId
}

function sendDeleteNotif (userId, deleteReason) {
    const notifTitle = `your post has been removed.`;
    const notifContent = `An administrator has removed your ${deleteReason} as it violates guidelines. If you wish to appeal, contact our wonderful QA, Carlos Guanzon`
    sendNotif (userId, notifTitle, notifContent);
  }

async function deleteCommit (event) {
    parent = event.target.closest('.REVIEW')
    if (!parent.classList.contains('list-group-item')){
        if (parent.classList.contains('estab')) 
            deleteRespoEstab(event);
        else await fetch('/review', {
            method: 'DELETE',
            body: JSON.stringify({
            reviewId: parent.id
            }),
            headers: {
            'Content-type': 'application/json; charset=UTF-8',
            },
            }).then(res => {console.log(res);
                switch (res.status) {
                    case 200: delRev (); break;
                    default:  statusResp(res.status);
                }
            }).catch((err) => console.log(err))
    }else {
        deleteReplyfetch (event)
    }
}

async function delRev () {
    bye = document.querySelector('.yourReview')
    bye.innerHTML = "";
    clearForm = document.querySelector("#reviewForm")
    clearForm.reset();
    if (document.querySelector('input[name="title"]').value != "")
        location.reload()
    
    btn = document.querySelector('.postReview')
    btn.innerHTML = "Post"
    updateImgInputList ()
    document.querySelector('input[name="reviewID"]').value = "";
    $('.revForm').collapse('show')
}

function showMoreReadLess(event) {
    parent = event.target.closest('.REVIEW')
    text = parent.querySelector('.reviewtext')
    if (text.classList.contains("truncate")) {
        $(text).removeClass('truncate') 
        text.style.cursor = "pointer";
    } else {
        $(text).addClass('truncate') 
    }
}

$('button.moreRev').on({
    click: function(event){
         $('div.moreRev').collapse('toggle')
        if ($(this).text().includes("more")) {
        $('button.moreRev').text('------------ see less ------------')
        }
        else {
            $('button.moreRev').text('see more')
        }
     }
 })

 async function respoEstab (event) {
    parent = event.target.closest('.REVIEW')
    formm = new FormData(parent.querySelector('form'));
    formm.append("revID", parent.id)
    event.preventDefault();

    await fetch("/estabRespo", {
        method: "POST",
        body: JSON.stringify({
            revID: formm.get("revID"),
            text: formm.get("text")
        }),
        headers: {
        'Content-type': 'application/json; charset=UTF-8',
        },
    }).then(async res => {console.log(res);
        switch (res.status) {
            case 200: 
            recipientUserId = await findTheUser (parent.id, "review")
            sendEstabResponseNotif (recipientUserId, parent.id)
            location.reload(); 
            break;
            default:  statusResp(res.status);
        }
    }).catch((err) => console.log(err))
}

function sendEstabResponseNotif (userId, postId) {
    let establishment = document.querySelector('.estabNamez').innerHTML;
    const notifTitle = `an establishment responded to your review.`;
    const notifContent = `<a class="text-secondary" href="/${establishment}">${establishment}</a> has a new response to your <a class="text-secondary"href="/${establishment}#${postId}">review</a>`
    sendNotif (userId, notifTitle, notifContent);
  }


async function editRespoEstab (event) {
    parent = event.target.closest('.REVIEW')
    formm = new FormData(parent.querySelector('form'));
    formm.append("revID", event.target.closest('.card.REVIEW').id)
    event.preventDefault();

    await fetch("/estabRespo", {
        method: "PATCH",
        body: JSON.stringify({
            revID: formm.get("revID"),
            text: formm.get("text")
        }),
        headers: {
        'Content-type': 'application/json; charset=UTF-8',
        },
    }).then(res => {console.log(res);
            switch (res.status) {
                case 200: doneTxt (event); break;
                default:  statusResp(res.status);
            }
    }).catch((err) => console.log(err))
}

async function deleteRespoEstab (event) {
    parent = event.target.closest('.REVIEW')
    formm = new FormData(parent.querySelector('form'));
    formm.append("revID", event.target.closest('.card.REVIEW').id)
    event.preventDefault();

    await fetch("/estabRespo", {
        method: "DELETE",
        body: JSON.stringify({
            revID: formm.get("revID"),
            text: formm.get("text")
        }),
        headers: {
        'Content-type': 'application/json; charset=UTF-8',
        },
    }).then(res => {console.log(res);
                switch (res.status) {
                case 200: parent.closest('.REVIEW.card').querySelector('.iconBox').innerHTML+= ` <span class="reply replybg"></span>`
                            parent.remove(); break;
                default:  statusResp(res.status);
                }
    }).catch((err) => console.log(err))
}

function statusResp (status) {
    switch (status) {
        case 401: console.log("401: no user credentials");window.location.replace("/login"); break;
        case 402: console.log("402: user banned"); break;
        case 400: console.log("400: Bad Request");break;
        case 500: console.log("500: Internal Server Error");break;
    }
}

async function replyfetch (event) {
    event.preventDefault();
    parent = event.target.closest('.REVIEW')
    formm = new FormData(parent.querySelector('form'));
    revID = parent.id;
    parID = null;

    if (parent.classList.contains('list-group-item')) {
        parID = revID;
        revID = null;
        formm = new FormData(parent.querySelector('form.herePo'))
    }

    formm.append("revID", revID)
    formm.append("parID", parID)

    await fetch("/comment", {
        method: "POST",
        body: JSON.stringify({
            revID: formm.get("revID"),
            parID: formm.get("parID"),
            text: formm.get("text")
        }),
        headers: {
        'Content-type': 'application/json; charset=UTF-8',
        },
    }).then(async res => {console.log(res);
            switch (res.status) {
                case 200: 
                res.json().then(he => 
            
                showReply (event, he)) ; 
                    
                let recipientUserId
                if (revID) {
                    recipientUserId = await findTheUser (revID, "review")
                    postId = revID
                    if (checkLock(postId)) sendReplyNotif (recipientUserId, postId, false)
                } else{ 
                    recipientUserId = await findTheUser (parID, "reply")
                    postId = parent.parentElement.closest('.REVIEW').id
                    if (checkLock(parID)) sendReplyNotif (recipientUserId, postId, true)
                }
                
                break;
                default:  statusResp(res.status);
            }
    }).catch((err) => console.log(err))
}


function checkLock (id) {
    replyNotifLocks = JSON.parse(localStorage.getItem("replyNotifLocks"));
    // console.log(replyNotifLocks)
    if (replyNotifLocks[id]) {
        // console.log(new Date () )
        // console.log(new Date(replyNotifLocks[id]))
        if (new Date () > new Date(replyNotifLocks[id]))
            return lock(id);
        else {
            console.log("nono")
            return false;
        }
    } else
        return lock(id)
}

function lock(id) {
    replyNotifLocks = JSON.parse(localStorage.getItem("replyNotifLocks"));
    replyNotifLocks[id] = new Date().getTime() + (5 * 60 * 1000); // adding  5 minutes in milliseconds
    localStorage.setItem('replyNotifLocks', JSON.stringify(replyNotifLocks));
    return true;
}

function sendReplyNotif (userId, postId, isComment) {
    const notifTitle = `your post has a new reply.`;
    sender = sessionStorage.getItem('savedUsername')
    let establishment = document.querySelector('.estabNamez').innerHTML;
    let commentNotif = ''
    if (isComment) commentNotif = `comment to a `

    const notifContent = `<a class="text-secondary" href="/users/${sender}">${sender}</a> replied to your ${commentNotif}<a class="text-secondary"href="/${establishment}#${postId}">review</a> in 
    <a class="text-secondary" href="/${establishment}">${establishment}</a>`;

    sendNotif (userId, notifTitle, notifContent);
  }

function editReply(event) {
    parent = event.target.closest('.REVIEW')
    desc = parent.querySelector( ".reviewtext");
    textarea = parent.querySelector( ".yourRevEdit");
    icon = parent.querySelector( ".edit-reply");
    btn = parent.querySelector(".doneEdit");

    desc.style.display = "none";
    textarea.style.display = null;
    icon.style.display = "none";
    btn.style.display = null;
    textarea.innerHTML = desc.innerHTML.trim();
}

async function editReplyfetch (event) {
    formm = new FormData(parent.querySelector('.edit-comment-form'));
    formm.append("commID", parent.id)
    event.preventDefault();

    await fetch("/comment", {
        method: "PATCH",
        body: JSON.stringify({
            commID: formm.get("commID"),
            text: formm.get("text")
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            },
    }).then(res => {console.log(res);
            switch (res.status) {
                case 200: doneTxt (event); break;
                default:  statusResp(res.status);
            }
    }).catch((err) => console.log(err))
}

async function deleteReplyfetch (event) {
    parent = event.target.closest('.REVIEW')
    event.preventDefault();

    await fetch("/comment", {
        method: "DELETE",
        body: JSON.stringify({commID: parent.id}),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            },
    }).then(res => {console.log(res);
        switch (res.status) {
            case 200: asd = parent.closest('ul')
                    parent.remove()
                    updateCommentCount (asd); break;
            default:  statusResp(res.status);
        }
    }).catch((err) => console.log(err))
}

function updateCommentCount (list) {
    parent = list.closest(".REVIEW")
    parent.querySelector('.cNum').innerHTML = list.childElementCount;
}

async function insertReview (event) {
    formDat = new FormData(document.forms.reviewForm)
    event.preventDefault();
    if (formDat.get("reviewID") != "") {
        yo = await fetch("/review", {
            method: "PATCH",
            body: formDat,
        })
        .then(res => {console.log(res);
            switch (res.status) {
                case 200: res.json().then(he => doneEditReview( he)); break;
                default:  statusResp(res.status);
            }
        }).catch((err) => console.log(err))
    } else {
    await fetch("/review", {
        method: "POST",
        body: formDat,
    }).then(res => {console.log(res);
        switch (res.status) {
            case 200: res.json().then(he =>  showReview (he)); break;
            default:  statusResp(res.status);
        }
    }).catch((err) => console.log(err))
}
}

async function doneEditReview(rez) {
    media = await rez.images.length + rez.videos.length;
    if (media > 0)
         location.reload()

    $('.revForm').collapse('hide')
    $('.yourReview').collapse('show')
    parent = document.querySelector('.yourReview')
    stat = parent.querySelector(".status")
    text = parent.querySelector(".reviewtext")
    title = parent.querySelector(".reviewTitle")
    media = parent.querySelector(".revMedia")
    if (media != null)
    media.remove()
    if (stat.innerHTML.includes(" • edited") == false)
    stat.innerHTML += " • edited";
    title.innerHTML = rez.title;
    text.innerHTML = rez.content;
    r = parent.querySelector('.mang-inasal');
    rate = rez.rating / 5 *100
    r.style.setProperty('--percent', `${rate}%`);
    s = parent.querySelector('.ratingz');
    s.innerHTML = rez.rating + ".0";
}

var x = "";

function editReview() {
    $('.revForm').collapse('show')
    $('.yourReview').collapse('hide')
    bye = document.querySelector('.yourReview')
    btn = document.querySelector('.postReview')
    btn.innerHTML = "done"
}

function editText(event) {
    parent = event.target.closest('.REVIEW')
    desc = parent.querySelector( ".reviewtext");
    textarea = parent.querySelector( ".yourRevEdit");
    icon = parent.querySelector( ".edit-review");
    btn = parent.querySelector(".doneEdit");

    desc.style.display = "none";
    textarea.style.display = null;
    icon.style.display = "none";
    btn.style.display = null;
    textarea.innerHTML = desc.innerHTML.trim();
}

function doneEditText(event){
    parent = event.target.closest('.REVIEW')
    desc = parent.querySelector(".reviewtext");
    textarea = parent.querySelector(".yourRevEdit");
    icon = parent.querySelector( ".edit-review");
    btn = parent.querySelector(".doneEdit");
    thestatus = parent.querySelector(".status");
 
    if (parent.classList.contains('estab')){ 
        editRespoEstab (event)
    }
    else {
        editReplyfetch (event)
    }
}

function doneTxt (event) {
    parent = event.target.closest('.REVIEW')
    desc = parent.querySelector(".reviewtext");
    textarea = parent.querySelector(".yourRevEdit");
    icon = parent.querySelector( ".edit-reply");
    btn = parent.querySelector(".doneEdit");
    thestatus = parent.querySelector(".status");
    if (thestatus == null)
        thestatus = parent.querySelector(".estabResponse");
    textarea.style.display = "none";
    desc.style.display = null;
    btn.style.display = "none";
    icon.style.display = null;
    desc.innerHTML = textarea.value.trim();
    
    if (thestatus.innerHTML.includes(" • edited") == false)
        thestatus.innerHTML += " • edited";
}

let fileInput = document.querySelector('#mediaInput');
let fileList = document.querySelector(".filelist");

if (fileInput) {
fileInput.addEventListener("change", () => {
    updateImgInputList ()
});
}

function updateImgInputList () {
    fileList.innerHTML = "";
    for (i of fileInput.files) {
      let listItem = document.createElement("li");
      let fileName = i.name;
      let fileSize = (i.size / 1024).toFixed(1);
      listItem.innerHTML = `<p>${fileName}</p><p>${fileSize}KB</p>`;
      if (fileSize >= 1024) {
        fileSize = (fileSize / 1024).toFixed(1);
        listItem.innerHTML = `<p>${fileName}</p><p>${fileSize}MB</p>`;
      }
      fileList.appendChild(listItem);
    }
}

function showReply (event, rez) {
    parent = event.target.closest('.REVIEW')
    replyList = parent.querySelector(':scope > .comment');
    if (replyList == null) {
        replyList = parent.querySelector(':scope .comment');
    }

    string1 = `
    <li class=" list-group-item REVIEW" id="${rez._id}" name="${rez._id}">
                                <div class="user-profile flex-center">
                                    <a href="/users/${rez.user.link}" class="flex-center"><img class="pfpRev img-fluid" src="${rez.user.profilePicture}" alt=""></a>
                                    <div class="postDeats">
                                        <a class="user-link" href="/users/${rez.user.link}">${rez.user.username}</a>
                                        <div class=" status">Just Now</div>
                                    </div>
                                </div>
                                <p class="reviewtext card-text">
                                ` 
    string2 = `
                                </p>
                                <form enctype="multipart/form-data" method="post" class="edit-comment-form">
                                <textarea name='text' class=" card-text yourRevEdit form-control mb-2" style="display: none;"></textarea>
                                <div class="flex-center iconBox">
                                    <span class="chat chatbg "></span>
                                    <span class="cNum card-text">0</span>
                                    <span class="up upbg"> </span>
                                    <span class=" uvote card-text">0</span>
                                    <span class="down downbg"></span>
                                    <span class="dvote card-text">0</span>
                                    <span class="edit-reply editbg ms-3"></span>
                                    <span class="del-reply delbg"></span>
                                    <button type="submit" class="doneEdit btn btn-sm btn-outline-success ms-2" style="display: none;">done</button>    
                                </div></form>

                            <!-- reply comment section list -->
                            <ul class="comment list-group list-group-flush collapse"></ul>
                        </li>
    
    `;
    
    parent.querySelector('.refly').value = "";
    replyList.innerHTML += (string1 + rez.content + string2)
    
    $(parent.querySelector('.wReply')).collapse('hide')
    $(replyList).collapse('show')
    
    updateCommentCount (replyList)
}



function showReview  ( rez) {
    reviewBox = document.querySelector('.yourReview');
    thefiles = document.querySelector('#mediaInput').files;
    $('.yourReview').collapse('show')
    $('.revForm').collapse('hide')
    string1 = `<p class="fw-light mb-2">Your Review</p>
    <div class="card REVIEW mb-3" id="${rez.review._id}">
                <div class="card-header reviewHeader flex-center">
                <div class="user-profile flex-center">
                <a href="/users/${rez.user.link}" class="flex-center"><img class="pfpRev img-fluid" src="${rez.user.profilePicture}" alt=""></a>
                <div class="postDeats">
                    <a class="user-link" href="/users/${rez.user.link}">${rez.user.username}</a>
                    <div class="c00000xx status">`
    string1a = "Just Now"
    string1b = `</div>
                </div>
                </div>
            <div>
                <h5 class="d-inline-blockz">
                <span class="ratingz">` + rez.review.rating + `.0</span><meter class="average-rating yourRevRating mang-inasal d-inline-block" min="0" max="5">
                </meter></h5>
            </div>
    </div>
    <div class="card-body reviewBody">
        <h6 class="card-title reviewTitle">` + rez.review.title +`</h6>
        <p class="c00000xx reviewtext card-text">
        ` + rez.review.content + `
        </p>
    
        `;

    string2 = ""
    string3 = "";
    if (thefiles.length > 0) {
        string2 = '<div class="card-body revMedia">'
        y = 4
        if (thefiles.length > 4)
            y = 3
        for(let x = 0; x < y; x++) {
            if (thefiles[x] instanceof File) {
                theURL = URL.createObjectURL( thefiles[x]);
                type = thefiles[x]['type'];
        
                switch (type.split('/')[0]) {
                    case "image":
                        string2 += '<span><img class="img-fluid" src="' + theURL +'"></span>'
                        break;
                    case "video":
                        string2 += '<span><video class="img-fluid" src="' + theURL +'" controls /></span>'
                        break;
                }
            }
        }
        string3 = "</div>"
    }
    string4 ="";
    string5 ="";
    if (thefiles.length > 4) {
        string3 = 
        `<button class="c00000xx imgBtn" data-bs-toggle="modal" data-bs-target=".c00000xx.moreImg">+` + (thefiles.length-3) +`</button>
        </div><div class="modal c00000xx moreImg">
                            <div class="modal-dialog modal-xl">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <button class="btn-close btn-close-success me-2" data-bs-dismiss="modal"></button>
                                </div><div class="modal-body  moreImgBox">
                `

                for (x in thefiles) {
                    if (thefiles[x] instanceof File) {
                        theURL = URL.createObjectURL( thefiles[x]);
                        type = thefiles[x]['type'];
                
                        switch (type.split('/')[0]) {
                            case "image":
                                string4 += '<span><img class="img-fluid" src="' + theURL +'"></span>'
                                break;
                            case "video":
                                string4 += '<span><video class="img-fluid" src="' + theURL +'" controls /></span>'
                                break;
                        }
                    }
                }   
                string5 = '</div></div> </div></div> '        
    }
    string6 = `
            <div class="flex-center iconBox">
            <span class=" chat chatbg "></span>
            <span class=" cNum card-text">0</span>
            <span class=" up upbg"> </span>
            <span class=" uvote card-text">0</span>
            <span class=" down downbg"></span>
            <span class=" dvote card-text">0</span>
            <span class="c00000xx editRev edit-review editbg ms-3"></span>
            <span class="del-review delbg"></span>
            
        </div>
        </form>
    </div>

    `;

    reviewBox.innerHTML = string1 + string1a + string1b + string2 + string3  + string4 + string5 + string6;
    
    if (thefiles.length > 4) {
    button = document.querySelector('.c00000xx.imgBtn')                                                     
    button.style.backgroundImage = 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('+ URL.createObjectURL( thefiles[3]) + ')'
    }
    document.querySelector('#mediaInput').value ="";
    r = document.querySelector(':root');
    r.style.setProperty('--yourRev', 'calc(' + rez.review.rating + '/ 5 * 100%)');
    document.querySelector('input[name="reviewID"]').value = rez.review._id;
}