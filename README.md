Orichalcum.Core
===============

A multipurpose(but now only XMPP) messaging center, enabling background
sending and receiving messages, and aiming at easing the job of writing a 
brand new instant messaging(IM) client.

Comes with a web UI, therefore this server itself is a client. But using its
APIs you can also write a frontend just as easy as this web UI, and this is
the real purpose of this project.

Dependencies
------------

* `node-xmpp`, you should have this firstly installed.

During my development, I have put the `node_modules/` under `./js/`.

Usage
-----

Support the server is running on `localhost:8000`. To run this server, simply
use:

    $ node service.js

where `service.js` is in the same path with this `README.md`.

Currently supports only XMPP, with login/logout control, send/receive message.
A web UI is provided by this server and accessible at: 

    http://localhost:8000/

or

    http://localhost:8000/interface

API
---

You may use API to control the hosting services provided by this server. In
fact, the web UI also use these APIs.

1. List of all XMPP clients' status

        http://localhost:8000/service/xmpp

2. View the status of a single client

        http://localhost:8000/service/jid@site.org/

3. Login

    **POST** to following URL:
    
        http://localhost:8000/service/xmpp/jid@site.org/login

    Including such a form in request body:

        password=SOMEPASSWORD

4. Logout

        http://localhost:8000/service/xmpp/jid@site.org/logout

5. Send a message

        http://localhost:8000/service/xmpp/sender@some.org/send/receiver@some.com


