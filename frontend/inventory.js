// const url = new URL(location.href);

const APILINK = "https://home-inventory-management-backend.vercel.app/api/";

// function fetchRooms(){
//     fetch(APILINK + "room/-1",{
//         method: "GET"
//     })
//     .then(res => res.json())
//     .then(res => {
//         console.log(res);
//         let newHtml = "";
//         let array = [];
//         res.forEach(element => {
//             let roomId = (element.roomId);
//             array.push(roomId);
//         });
//         console.log(array);
//         let set = new Set(array);
//         console.log(set);
//         set.forEach(element => {
//             let name = getRoomName(element);
//             newHtml += `
//             <button id="card-btn" onclick="redirectPage('${element}');">
//                 <div class="card-container">
//                     <div class="card">
//                         <h4>${name}</h4>
//                     </div>
//                 </div>
//             </button>
//             `;
//         });
//         document.getElementById("inventory").innerHTML = newHtml;
//     })
// }

// function getRoomName(id){
//     fetch(APILINK + "room/" + id.toString(), {
//         method: "GET"
//     })
//     .then(res => res.json())
//     .then(res => {
//         console.log(res);
//         console.log(res[0].roomName);
//         return res[0].roomName;
//     })
// }

// function redirectPage(ele){
//     const params = new URLSearchParams({
//         "id" : ele.roomId,
//         "roomname" : ele.room
//     }).toString();
//     window.location.href = "items.html?" + params;
// }

// async function fetchRooms() {
//     try {
//         const res = await fetch(APILINK + "room/-1", { method: "GET" });
//         const data = await res.json();
//         console.log(data);
//         let newHtml = "";
//         let array = [];
//         data.forEach(element => {
//             let roomId = element.roomId;
//             array.push(roomId);
//         });
//         console.log(array);
//         let set = new Set(array);
//         console.log(set);
//         for (const element of set) {
//             let name = await getRoomName(element);
//             newHtml += `
//             <button id="card-btn" onclick="redirectPage('${element}');">
//                 <div class="card-container">
//                     <div class="card">
//                         <h4>${name}</h4>
//                     </div>
//                 </div>
//             </button>
//             `;
//         }
//         document.getElementById("inventory").innerHTML = newHtml;
//     } catch (error) {
//         console.error('Error fetching rooms:', error);
//     }
// }

// async function getRoomName(id) {
//     try {
//         const res = await fetch(APILINK + "room/" + id.toString(), { method: "GET" });
//         const data = await res.json();
//         return data[0].roomName;
//     } catch (error) {
//         console.error('Error fetching room name:', error);
//         return 'Unknown Room';
//     }
// }

// function redirectPage(ele) {
//     const params = new URLSearchParams({ id : ele });
//     window.location.href = `items.html?${params.toString()}`;
// }

// function fetchItems(){
//     fetch(APILINK + "room/1",{
//         method: "GET"
//     })
//     .then(res => res.json())
//     .then(res => {
//         console.log(res);
//         let newHtml = "";
//         res.forEach(element => {
//             let name = element.name;
//             let quantity = element.quantity;
//             newHtml += `
//             <div class="card-container">
//                 <div class="card-img">
//                     hello
//                 </div>
//                 <div class="card">
//                     <h4>${name}</h4>
//                     <h4>${quantity}</h4>         
//                 </div>
//             </div>`;
//         });
//         document.getElementById("inventory").innerHTML = newHtml;
//     })
// }

function fetchAllItems(){
    fetch(APILINK + "room/all",{
        method: "GET"
    })
    .then(res => res.json())
    .then(res => {
        console.log(res);
        res.forEach(element => {
            let newHtml = "";
            let name = element.name;
            let quantity = element.quantity;
            let roomName = element.roomName;
            
            newHtml = `
            <div class="card-container">
            <div class="card" id = "${name}-${roomName}">
                    <div class="card-img">
                        <ion-icon name="cube"></ion-icon>
                    </div>

                    <div class = "itemNameDiv">
                        <h4>${name}</h4>
                    </div>
                    <div class = "itemQuantityDiv">
                        <h4>${quantity} units</h4>
                    </div>
                    <div class= "cardEditDelBtn">
                        <span><button id="editBtn" class="cardBtns" onclick = "editItem('${name}','${roomName}','${quantity}')"><ion-icon name="color-wand"></ion-icon></button><button id="deleteBtn" class="cardBtns" onclick= "deleteItem('${name}','${roomName}')"><ion-icon name="trash"></ion-icon></button></span>
                    </div>
                </div>
            </div>`;
            document.getElementById("inventory").innerHTML += newHtml;
        });
    })
}

fetchAllItems();


// To create new item
function addItems(itemName,catg,quantity){
    fetch(APILINK + "new",{
        method: "POST",
        body : JSON.stringify({
            name : itemName,
            roomName : catg,
            quantity : quantity
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(res => res.json())
    .then(res => {
        console.log(res)
        location.reload();
    })

}


// listening to the event of submit button pressed and gathering details
let detailForm = document.getElementById("itemForm");
detailForm.addEventListener("submit",(e) => {
    e.preventDefault();
    let itemName = document.querySelector("#nameInput").value;
    let catg = document.querySelector("#categoryInput").value;
    let quantity = document.querySelector("#quantityInput").value;
    addItems(itemName,catg,quantity);
});

function deleteItem(name,roomName){
    fetch(APILINK + `room/${roomName}/item/${name}` ,
        {method : "DELETE"}
    )
    .then(res => {
        location.reload();
    })
}

// To edit the item
function editItem(name,roomName,quantity){
    let item = document.getElementById(`${name}-${roomName}`);
    item.innerHTML = `
        <div class="edit-card-container">
            <div class="edit-card" id = "${name}-${roomName}">
                <input id="editName" type="text" required value="${name}">
                <input id="editRoomName" type="text" required value="${roomName}">
                <input id="editQuantity" type="number" required value="${quantity}">
                <span><button onclick = "updateItem('${name}','${roomName}')">Save</button></span>
            </div>
        </div>
    `
}

function updateItem(name,roomName){
    let itemName = document.querySelector("#editName").value;
    let catg = document.querySelector("#editRoomName").value;
    let quantity = document.querySelector("#editQuantity").value;

    fetch(APILINK + `room/${roomName}/item/${name}` , {
        method : "PUT",
        body : JSON.stringify({
            name : itemName,
            roomName : catg,
            quantity : quantity
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
})
    .then(res => {
        location.reload();
    })
}

// making the background translucent when add Item button is clicked

function BlurFeature(){
    let mainOne = document.getElementById("mainId").classList.add("main");
}

const mainDiv = document.querySelector("#mainDiv");
const wrapper = document.querySelector('.wrapper');
const btnAddItem = document.querySelector('#addItem');
const btnCloseAddItem = document.querySelector('.itemClose');
btnAddItem.addEventListener('click',() => {
    wrapper.classList.add('addItemPopup');
    mainDiv.classList.add('mainDiv');
})

btnCloseAddItem.addEventListener('click',() => {
    wrapper.classList.remove('addItemPopup');
    mainDiv.classList.remove('mainDiv');
})



// taking the input from the search bar
const search = document.querySelector('#allItemsSearch');
const searchBtn = document.querySelector('.searchBtn');
searchBtn.addEventListener('click',() => {
    getItem();
})

search.addEventListener('keypress',(e) => {
    if( e.key === "Enter"){
        getItem();
    }
})

function getItem(){
    const name = search.value;
    fetch(APILINK + `item/${name}`,{
        method : 'GET'
    })
    .then( res => res.json())
    .then( res => {
        // console.log(res);
        let quantity = res.quantity;
        let roomName = res.roomName;
        newHtml = `
            <div class="card-container">
            <div class="card" id = "${name}-${roomName}">
                    <div class="card-img">
                        <ion-icon name="cube"></ion-icon>
                    </div>

                    <div class = "itemNameDiv">
                        <h4>${name}</h4>
                    </div>
                    <div class = "itemQuantityDiv">
                        <h4>${quantity} units</h4>
                    </div>
                    <div class= "cardEditDelBtn">
                        <span><button id="editBtn" class="cardBtns" onclick = "editItem('${name}','${roomName}','${quantity}')"><ion-icon name="color-wand"></ion-icon></button><button id="deleteBtn" class="cardBtns" onclick= "deleteItem('${name}','${roomName}')"><ion-icon name="trash"></ion-icon></button></span>
                    </div>
                </div>
            </div>`;
            document.getElementById("inventory").innerHTML = newHtml;

        
    })
}

const searchClose = document.querySelector('.searchClose');
search.addEventListener('input',() => {
    searchClose.classList.add('searchClosePopup');
})


searchClose.addEventListener('click', () => {
    document.getElementById("inventory").innerHTML = '';
    search.value = '';
    fetchAllItems();
    searchClose.classList.remove('searchClosePopup');
})
