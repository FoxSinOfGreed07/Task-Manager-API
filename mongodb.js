// const mongodb = require('mongodb');
// const MongoClient = mongodb.MongoClient;
// const ObjectID = mongodb.ObjectID;
const {MongoClient, ObjectID} = require('mongodb');

const connectionURL = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';

MongoClient.connect(connectionURL, {useNewUrlParser : true}, (error, client) =>{
    if(error){
        return console.log('unable to connect to the database!');
    }
    const db = client.db(databaseName);
    
    db.collection('tasks').find({completed : false}).toArray((error,tasks) =>{
        if(error){
            return console.log('Unable to find Tasks!');
        }
        console.log(tasks);
    });
})