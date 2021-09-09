import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';


interface MyDB extends DBSchema{
  'task-store':{
    key: string;
    value: string;
  };
}

@Injectable({
  providedIn: 'root'
})

export class IndexedDBService {
  private db: IDBPDatabase<MyDB>;

  constructor() {
    this.connectToDb();
   }

  async connectToDb(){
    this.db = await openDB<MyDB>('my-db', 1, {
      upgrade(db){
        db.createObjectStore('task-store')
      },
    });
  }

  addTask(quote: string){
    return this.db.put('task-store', quote, 'quote')
  }

  deleteTask(key: string){
    return this.db.delete('task-store', key)
  }
}


