Orichalcum.Core
===============

The core process, which should be a background service, of orichalcum, is
designed to automatically login, send and receive XMPP stuff, like one of a
XMPP client.

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


