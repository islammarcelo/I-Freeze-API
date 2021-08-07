
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');


const admin = require('firebase-admin')
admin.initializeApp();
const database = admin.firestore();

const fridgeApp = express();
fridgeApp.use(cors({origin: true}));

//************************************************************************************//
//This Function To Get All Fridges In Database.
fridgeApp.get('/getAllFridges/:userId',async (req, res)=> {
    const snapshot =await database.collection("users").doc(req.params.userId).collection('fridges').get();
    
    let fridges = [];
    snapshot.forEach(doc => {
        let id   = doc.id;
        let data = doc.data();
        fridges.push(id,data)
    });

    res.status(200).send(JSON.stringify(fridges));
});
//************************************************************************************//
//This Function To Get Specific Fridge By UserId And FridgeId.

fridgeApp.get("/getFridge/:userId/:fridgeId", async (req,res)=>{
    try{
        const snapshot = await database.collection("users").doc(req.params.userId).collection('fridges').doc(req.params.fridgeId).get();
        const fridgeId = snapshot.id;
        const fridgeData = snapshot.data();
        res.status(200).send(JSON.stringify({id: fridgeId, ...fridgeData}));
    }
    catch (error) {
        console.log(error);
        var out = JSON.stringify({ status: "Something went wrong!" });
        res.status(500).send(out);
    }
   
})

//************************************************************************************//
//This Function To Update The Attributes Of Fridge, You Must Put Data In Body.

fridgeApp.put("/updateFridge/:userId/:fridgeId", async (req, res) =>{
    const fridge = req.body;
    try{
        await database.collection("users").doc(req.params.userId).collection('fridges').doc(req.params.fridgeId).update({
            ...fridge
        });
        
        res.status(200).send(JSON.stringify({"messgae":"Fridge Updated Successfully!"}));
    
    }
    catch (error) {
        console.log(error);
        var out = JSON.stringify({ status: "Something went wrong!" });
        res.status(500).send(out);
    }

});

//************************************************************************************//
//This Function To Delete Specific Fridge By ID.

fridgeApp.delete("/deleteFridge/:userId/:fridgeId", async (req, res) =>{
    await database.collection("users").doc(req.params.userId).collection('fridges').doc(req.params.fridgeId).delete();

    res.status(200).send(JSON.stringify({"messgae":"Fridge Deleted Successfully!"}));
})

//************************************************************************************//
//This Function To Add New User By Username And Password

fridgeApp.post('/createUser', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    try {
        const user = req.body;
    if(Object.keys(user).length === 0){

        res.status(400).send(JSON.stringify({messgae:"Please entre user data! "}));
    }else{
    await database.collection('users').add(user);
    res.status(201).send(JSON.stringify({messgae:"User Created Successfully! "}));
    }
    }
    catch (error) {
        console.log(error);
        var out = JSON.stringify({ status: "Something went wrong!" });
        res.status(500).send(out);
    }
})

//************************************************************************************//
//This Function To Add New Fridge For User By Id of The User

fridgeApp.post('/createFridge/:userId', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    try {
        const fridge = req.body;
    if(Object.keys(fridge).length === 0){

        res.status(400).send(JSON.stringify({messgae:"Please entre fridge data! "}));
    }else{
    await database.collection('users').doc(req.params.userId).collection("fridges").add(fridge);
    res.status(201).send(JSON.stringify({messgae:"Fridge Created Successfully! "}));
    }
    }
    catch (error) {
        console.log(error);
        var out = JSON.stringify({ status: "Something went wrong!" });
        res.status(500).send(out);
    }
})

//************************************************************************************//
//This Function To Add New Door History by (time and doorStatus)

fridgeApp.put('/doorHistory/:userId/:fridgeId', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    try {
        const fridgeRef = database.collection('users').doc(req.params.userId).collection('fridges').doc(req.params.fridgeId);
        const doorHistory = req.body;
        
        const key = doorHistory["dateTime"];
        const value = doorHistory["doorStatus"];
        
        
    if(Object.keys(doorHistory).length === 0){

        res.status(400).send(JSON.stringify({messgae:"Please entre door data! "}));
    }else{
    await database.runTransaction(transaction => {
        return transaction.get(fridgeRef).then(snapshot => {
          var largerMap = new Map(Object.entries(snapshot.get('doorHistory')));
          
          largerMap.set(key,value);
          
          let obj = Array.from(largerMap).reduce((obj, [key, value]) => (
            Object.assign(obj, { [key]: value }) // Be careful! Maps can have non-String keys; object literals can't.
          ), {});
          
          transaction.update(fridgeRef, 'doorHistory', obj);
          res.status(201).send(JSON.stringify({messgae:"Door History Created Successfully! "}));
        });
      });
    }
    }
    catch (error) {
        console.log(error);
        var out = JSON.stringify({ status: "Something went wrong!" });
        res.status(500).send(out);
    }
})

//************************************************************************************//
//This Function To Add New Temperature History by (time and temperature)

fridgeApp.put('/temperatureHistory/:userId/:fridgeId', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    try {
        const fridgeRef = database.collection('users').doc(req.params.userId).collection('fridges').doc(req.params.fridgeId);
        const temperatureHistory = req.body;
        
        const key = temperatureHistory["dateTime"];
        const value = temperatureHistory["temperature"];
        
        
    if(Object.keys(temperatureHistory).length === 0){

        res.status(400).send(JSON.stringify({messgae:"Please entre door temperature! "}));
    }else{
    await database.runTransaction(transaction => {
        return transaction.get(fridgeRef).then(snapshot => {
          var largerMap = new Map(Object.entries(snapshot.get('temperatureHistory')));
          
          largerMap.set(key,value);
          
          let obj = Array.from(largerMap).reduce((obj, [key, value]) => (
            Object.assign(obj, { [key]: value }) // Be careful! Maps can have non-String keys; object literals can't.
          ), {});
          
          transaction.update(fridgeRef, 'temperatureHistory', obj);
          res.status(201).send(JSON.stringify({messgae:"temperature History Created Successfully! "}));
        });
      });
    }
    }
    catch (error) {
        console.log(error);
        var out = JSON.stringify({ status: "Something went wrong!" });
        res.status(500).send(out);
    }
})

//************************************************************************************//
//This Function To Add New Humidity History by (humidity and temperature)

fridgeApp.put('/humidityHistory/:userId/:fridgeId', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    try {
        const fridgeRef = database.collection('users').doc(req.params.userId).collection('fridges').doc(req.params.fridgeId);
        const humidityHistory = req.body;
        const key = humidityHistory["dateTime"];
        const value = humidityHistory["humidity"];
        
    if(Object.keys(humidityHistory).length === 0){

        res.status(400).send(JSON.stringify({messgae:"Please entre humidity data! "}));
    }else{
    await database.runTransaction(transaction => {
        return transaction.get(fridgeRef).then(snapshot => {
          var largerMap = new Map(Object.entries(snapshot.get('humidityHistory')));
          
          largerMap.set(key,value);
          
          let obj = Array.from(largerMap).reduce((obj, [key, value]) => (
            Object.assign(obj, { [key]: value }) // Be careful! Maps can have non-String keys; object literals can't.
          ), {});

          transaction.update(fridgeRef, 'humidityHistory', obj);
          res.status(201).send(JSON.stringify({messgae:"humidity History Created Successfully! "}));
        });
      });
    }
    }
    catch (error) {
        console.log(error);
        var out = JSON.stringify({ status: "Something went wrong!" });
        res.status(500).send(out);
    }
})
//************************************************************************************//

exports.fridgeApp = functions.https.onRequest(fridgeApp);

