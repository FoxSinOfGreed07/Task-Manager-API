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
    db.collection('users').updateOne({
        _id : new ObjectID('5fb8de6654862c22b8298c46')
    },
    {
        $set : [{
            name : 'GrizzlySinOfSloth',
            a : 'Harlequin'
        },
        {
            name : 'FoxSinOfGreed',
            a : 'Ban'
        }]
    }).then((result)=>{
        console.log('Successful!',result);
    }).catch((error)=>{
        console.log('Failed!', error);
    })
    

})