importScripts('./ngsw-worker.js');

self.addEventListener('sync', (event) => {
  if(event.tag === 'post-data'){
    event.waitUntil(getAndSendTask())
  }
})

function addTask(newTask){
  let obj = {
    task: newTask
  };
  fetch('http://localhost:4000/data', {
    method:'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj)
  }).then(() => Promise.resolve())
    .catch(() => Promise.reject());
}

function getAndSendTask(){
  let db;
  const request = indexedDB.open('my-db');
  request.onerror = (event) => {
    console.log('using Indexed DB')
  };
  request.onsuccess = (event) => {
    db = event.target.result;
    getTask(db);
  };
};

function getTask(db){
  const transaction = db.transaction(['task-store']);
  const objStore = transaction.objStore('task-store');
  const request = objStore.get('task');
  request.onerror = (event) => {

  };
  request.onsuccess = (event) => {
    addTask(request.result);
    console.log(`Recommended task is ${request.result}`)
  }
}
