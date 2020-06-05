

// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('./service.js')
// }

// document.body.onclick = function(){
//     getSubscription()
//     .then(subscription => {
//         if (subscription) {
//             /// console.log("đã có subscription")
//             return subscription
//         } else {
//             return getNotificationPermission()
//             .then(function(){
//                 return doSubscribe()
//             })
//         }
//     })
//     .catch(err => {
//         console.log(err);
//     })
// }

function getSubscription() {
    return navigator.serviceWorker.ready.then((serviceWorkerRegistration) => {
        return serviceWorkerRegistration.pushManager.getSubscription()
    })
}

function getNotificationPermission() {
    return new Promise((resolve, reject) => {
        if (Notification.permission === 'denied') {
            console.log('Push messages are blocked.')
            return reject(new Error('Push messages are blocked.'));
        }

        if (Notification.permission === 'granted') {
            return resolve();
        }

        if (Notification.permission === 'default') {
            Notification.requestPermission(
                (result) => {
                if (result !== 'granted') {
                    console.log('Bad permission result')
                    reject(new Error('Bad permission result'));
                }

                resolve();
                }
            );
        }
    })
}

function doSubscribe() {
    console.log('begin subscribeUser')

    console.log("requestPermission success")
    
    const options = {
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(appPublicKey)
    }

    return navigator.serviceWorker.ready
    .then((serviceWorkerRegistration) => {
        return serviceWorkerRegistration.pushManager.subscribe(options)
    })
    .then(function (subscription) {
        console.log(subscription, 'User is subscribed.')

        updateSubscriptionOnServer(subscription)
    })
    .catch(function (err) {
        console.log('Failed to subscribe the user: ', err)
    })
}


// Converts the URL-safe base64 encoded |base64UrlData| to an Uint8Array buffer.
function base64UrlToUint8Array(base64UrlData) {
    const padding = '='.repeat((4 - base64UrlData.length % 4) % 4);
    const base64 = (base64UrlData + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const buffer = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        buffer[i] = rawData.charCodeAt(i);
    }
    return buffer;
}


function updateSubscriptionOnServer(subscription) {
    // TODO: Send subscription to application server
    console.log(subscription, "FETCH TO SERVER")

    const SERVER_URL = DOMAIN + "/save-subscription";
    return fetch(SERVER_URL, {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(subscription)
    })
    .then(function (response) {
        return response.json();
    })
}