/*
 ___ _       _           _   _             
/ __| |_ _ _(_)__ _ _  _| | /_\  _ __ _ __ 
\__ \  _| '_| / _` | || | |/ _ \| '_ \ '_ \
|___/\__|_| |_\__, |\_,_|_/_/ \_\ .__/ .__/
`             |___/             |_|  |_|   
Kollaboratív strigulázós app


Used libraries:
- PeerJS <https://peerjs.com/>
- js-cookie <https://github.com/js-cookie/js-cookie>

*/

function randomStr(blocks) {
    var block = Math.floor((1 + Math.random()) * 0x10000).toString(32);
    return ((blocks > 0) ? block + randomStr(blocks-1) : '');
}


function counterElement(id, name, count) {
    const element = document.createElement('div');
    
    const nameElement = document.createElement('span');
    nameElement.classList.add('name');
    nameElement.innerText = name;
    
    const counter = document.createElement('span');
    counter.classList.add('counter');
    counter.innerText = count;
    
    const plusButton = document.createElement('span');
    plusButton.classList.add('increment');
    plusButton.innerText = '+';

    plusButton.onclick = () => adder(id);
    
    element.appendChild(nameElement);
    element.appendChild(counter);
    element.appendChild(plusButton);

    return element;
}


function initUI(data) {
    counterList = document.getElementById('counters');

    data.forEach(element => {
        const listItem = counterElement(element.id, element.name, element.counter);
        
        listItem.style.animationDelay = (counterList.children.length * 0.05) + 's';

        counterList.appendChild(listItem);
        
        counters[element.id] = {
            name: element.name,
            counter: parseInt(element.counter),
            domElement: listItem.children[1]
        };
    });

    var addCounter = document.getElementById('addCounter')
    addCounter.style.animationDelay = (counterList.children.length * 0.05 + 0.1) + 's';
    addCounter.style.display = 'block';
}


function connectionSetup(connection) {
    connection.on('open', function() {
        connections.push(connection);
        document.getElementById('onlineCounter').innerText = connections.length + 1;
    });

    connection.on('data', data => handler(data));

    connection.on('close', function() {
        connections = connections.filter(item => item !== connection);
        document.getElementById('onlineCounter').innerText = connections.length + 1;
    });
}


function handler(data) {
    if (data.name) {
        listItem = counterElement(data.id, data.name, data.counter);

        counterList.appendChild(listItem);

        counters[data.id] = {
            name: data.name,
            counter: data.counter,
            domElement: listItem.children[1]
        };
    }
    else {
        counters[data.id].counter = data.counter;
        counters[data.id].domElement.innerText = counters[data.id].counter;    
    }
}


function adder(id) {
    counters[id].counter += 1;
    counters[id].domElement.innerText = counters[id].counter;
    
    connections.forEach(conn => conn.send({ id: id, counter: counters[id].counter }));

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "api/add.php", true);
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.send(`id=${id}`);
}

/* Main part */

var connections = [];
var counters = [];

if (!Cookies.get('session')) {
    Cookies.set('session', randomStr(8), {expires: 365, path: '/', sameSite: 'strict'});
}

var xmlhttp = new XMLHttpRequest();

xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(this.responseText);
        
        initUI(data.counters);

        data.peers.forEach(element => {
            if (element[0] != peer.id) {
                conn = peer.connect(element[0]);
                connectionSetup(conn);
            }
        });
    }
};

var peer = new Peer(options = { debug:2 });
peer.on('open', function(id) {
    document.getElementById('onlineCounter').innerText = 1;
    xmlhttp.open("POST", "api/join.php", true);
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.send("webrtc=" + id);
});

peer.on('connection', conn => connectionSetup(conn));

document.getElementById('addCounter').onclick = function() {
    var name = window.prompt("New counter's name:")
    if(name == null || name == '') { return; }

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var id = parseInt(this.responseText);
            connections.forEach(conn => conn.send({ id: id, name: name, counter: 0 }));
            handler({ id: id, name: name, counter: 0 })
        }
    };
    
    xmlhttp.open("POST", "api/add.php", true);
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.send("name=" + name);
}