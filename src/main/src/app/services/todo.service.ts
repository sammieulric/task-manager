import { Injectable, ApplicationRef } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable, interval} from 'rxjs';
import { Todo } from '../models/todo';
import { SwUpdate, SwPush } from '@angular/service-worker';
import { IndexedDBService } from './indexed-db.service';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type' : 'application/json'
  })
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  todosLimit = '?_limit=5';
  todosUrl:string = 'https://jsonplaceholder.typicode.com/todos';
  private readonly publicKey = 'BNOUkGKCHatL4_MMMEicON50iv6wze32VhGwrPui9zonWIabpb3jp_rhNI2Qs3TkbxBSUvi4cR8I_7ZCSo77Tqk';

  constructor(private http:HttpClient, private update: SwUpdate ,
               private appRef: ApplicationRef, private swPush: SwPush,
               private idb: IndexedDBService) { }

  getTodos():Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.todosUrl}${this.todosLimit}`);
  }

  deleteTodo(todo:Todo): Observable<Todo>{
    const url = `${this.todosUrl}/${todo.id}`;
    return this.http.delete<Todo>(url, httpOptions);
  }

  addTodo(todo:Todo):Observable<Todo>{
    return this.http.post<Todo>(this.todosUrl, todo, httpOptions);
  }

  toggleCompleted(todo: Todo):Observable<any>{
    const url = `${this.todosUrl}/${todo.id}`;
    return this.http.put(url, todo, httpOptions)
  }

  updateApp(){
    if(!this.update.isEnabled){
      console.log("Not Enabled");
      return;
    }
    this.update.available.subscribe((event)=>{
      if(confirm("New update is available for this app")){
        this.update.activateUpdate().then(()=>location.reload());
      }
    });

    this.update.activated.subscribe((event)=>{
      console.log(`current, ${event.previous}, available, ${event.current}`)
    })
  }

  checkUpdate(){
    this.appRef.isStable.subscribe((isStable)=>{
      if(isStable){
        const timeInterval = interval(10*3600*1000);

        timeInterval.subscribe(()=>{
          this.update.checkForUpdate().then(()=> console.log('checked'));
          console.log('Update Checked!');
        });
      }
    })
  }

  pushSubscription(){
    if(!this.swPush.isEnabled){
      console.log('push notification not enabled!');
      return;
    }
    this.swPush.requestSubscription({
      serverPublicKey: this.publicKey,
    }).then((sub) => {
      console.log(JSON.stringify(sub));
    })
      .catch((err) => console.log(err));
  };

  // pushMessages(){
  //   this.swPush.messages.subscribe((message) => console.log(message));
  // };

  pushNotificationClick(){
    this.swPush.notificationClicks.subscribe(
      ({action, notification}) => {
        window.open(notification.data.url);
      });
  }

  backgroundSync(){
    navigator.serviceWorker.ready
      .then((swReg) => swReg.sync.register('post-data'))
      .catch(console.log);
  }

  postSync(){
    let obj = {
      task: 'Go Shopping!'
    }

    this.http.post('http://localhost:4000/data', obj).subscribe(
      res => {
        console.log(res);
      }, err =>{
        this.idb.addTask(obj.task)
        .then(this.backgroundSync)
        .catch(console.log);
        //this.backgroundSync();
      }
    )
  }
}
