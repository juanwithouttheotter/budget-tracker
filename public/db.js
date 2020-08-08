let db;

const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = ({ target }) => {

    db = target.result;

    const objectStore = db.createObjectStore("pending", { key: "id", autoIncrement: true });
};

request.onsuccess = ({ target }) => {
    db = target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function ({ target }) {
    console.log("There are not the droids you are looking for.." + target.result.errorCode);
};

function saveRecord(record) {

    const transaction = db.transaction(["pending"], "readwrite");

    const objectStore = transaction.objectStore("pending");

    objectStore.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");

    const objectStore = transaction.objectStore("pending");

    const getAll = objectStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                    const transaction = db.transaction(["pending"], "readwrite");

                    const objectStore = transaction.objectStore("pending");

                    objectStore.clear();
                });
        }
    };
}

window.addEventListener("online", checkDatabase);