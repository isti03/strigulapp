**disclaimer**: this project is made for fun, and some it's implementaion is considered bad practice. 


# Objective 

Realtime collaborative daily counters

# Backend

The databse structure can be found in the `init.sql` file.

The API endpoints are in the `api/` folder.

### ```POST join.php?webrtc=```

- initiates the connection and provides the initial information
- `webrtc`: the webRTC id of the client, acquired from the PeerServer of [PeerJS](https://peerjs.com/)
- response structure:
  ```
  {
      "peers": ["peer1-id", "peer2-id", ...],
      "counters": [
        {
          "id": "0",
          "name": "name",
          "counter": "0",
        },
        { 
          ...
        }
      ]
  }
  ```

### ```POST add.php?id=```

- adds 1 to the counter specified by `id`
- the client expexcts no response body, just a successful HTTP response code

### ```POST add.php?name=```
- adds `name` to the available counters
- when the successful HTTP response arrives, the client notifies the other clients through webRTC