//Data base connnection
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
var serviceAccount = require("./hack_key.json");
initializeApp({
    credential: cert(serviceAccount)
});
const db = getFirestore();
//for session storage
const sessionStorage = require('sessionstorage-for-nodejs');
//for alert
const notifier = require('node-notifier');
//for express
const express = require('express');
const app = express();
//for body-parser
const bp = require('body-parser');
app.use(bp.urlencoded({ extended: true }));
//for ejs
const ejs = require('ejs');
app.set('view engine', 'ejs');
app.get("/", (req, res) => {
    res.render("home.ejs")
});
app.post('/login', (req, res) => {
    const u_id = req.body.u_id;
    const pwd = req.body.pwd;
    const usr = req.body.user;
    console.log(usr);
    if (usr == "student") {
        db.collection(usr).where('roll', '==', u_id).get().then((dbd) => {
            if (dbd.empty) {
                notifier.notify({
                    title:'Placements Portal',
                    message:"Your details are not found please contact admin",
                    sound: true, 
                    wait: true
                });
                res.render('home.ejs')
            }
            else {
                dbd.forEach((doc) => {

                    if (doc.data().pwd == pwd) {
                        sessionStorage.setItem('id', u_id);
                        console.log(sessionStorage.getItem('id'));
                        let n1=doc.data().name;
                        let n2=Object.keys(doc.data().notifications).length;
                        let data1={
                            name:n1,
                            count:n2
                        }
                        res.render('student_home.ejs',{data:data1});
                    }
                    else{
                        notifier.notify({
                            title:'Placements Portal',
                            message:"Incorrect password",
                            sound: true, 
                            wait: true
                        });
                        res.render('home.ejs');
                    }
                });
            }
        })
    }
    else if(usr=="coordinator"){
        db.collection(usr).where('id', '==', u_id).get().then((dbd) => {
            if (dbd.empty) {
                notifier.notify({
                    title:'Placements Portal',
                    message:"Your details are not found please contact admin",
                    sound: true, 
                    wait: true
                });
                res.render('home.ejs')
            }
            else {
                dbd.forEach((doc) => {

                    if (doc.data().pwd == pwd) {
                        sessionStorage.setItem('id', u_id);
                        console.log(sessionStorage.getItem('id'));
                        let n1=doc.data().name;
                        let n2=Object.keys(doc.data().notifications).length;
                        let data1={
                            name:n1,
                            count:n2
                        }
                        res.render('coordinator_home.ejs',{data:data1});
                    }
                    else{
                        notifier.notify({
                            title:'Placements Portal',
                            message:"Incorrect password",
                            sound: true, 
                            wait: true
                        });
                        res.render('home.ejs');
                    }
                });
            }
        }) 
    }
    else{
        {
            db.collection(usr).where('id', '==', u_id).get().then((dbd) => {
                if (dbd.empty) {
                    notifier.notify({
                        title:'Placements Portal',
                        message:"Your details are not found please contact admin",
                        sound: true, 
                        wait: true
                    });
                    res.render('home.ejs')
                }
                else {
                    dbd.forEach((doc) => {
    
                        if (doc.data().pwd == pwd) {
                            sessionStorage.setItem('id',u_id);
                            console.log(sessionStorage.getItem('id'));
                            let n1=doc.data().name;
                            let data1={
                                name:n1,
                            }
                            res.render('admin_home.ejs',{data:data1});
                        }
                        else{
                            notifier.notify({
                                title:'Placements Portal',
                                message:"Incorrect password",
                                sound: true, 
                                wait: true
                            });
                            res.render('home.ejs');
                        }
                    });
                }
            }) 
        }
    }
});
app.get('/std_details',(req,res)=>{
    const id1=sessionStorage.getItem('id');
    console.log(id1);
    db.collection('student').where('roll', '==', id1).get().then((dbd)=>{
        dbd.forEach((doc)=>{
            let data1={
                roll:doc.data().roll,
                name:doc.data().name,
                count:Object.keys(doc.data().notifications).length,
                dept:doc.data().dept,
                dob:doc.data().dob,
                gen:doc.data().gender,
                mail:doc.data().mail,
                phn:doc.data().phn,
                add:doc.data().address.dr_n0+" , "+doc.data().address.street+" , "+doc.data().address.place+" , "+"pin:"+doc.data().address.pincode
            }
            console.log(data1)
            res.render("std_details.ejs",{data:data1});
        })
        
    })
});
app.get("/pla_history",(req,res)=>{
    var id1=sessionStorage.getItem('id');
    console.log(id1);
    let data1={
        name:"",
        count:"",
        history:{},
    }
    db.collection('student').where('roll', '==', id1).get().then((dbd)=>{
        dbd.forEach((doc)=>{
            data1.name=doc.data().name;
            data1.count=Object.keys(doc.data().notifications).length;
            db.collection('placements').where('id','==',id1).get().then((dbd)=>{
                let i=1
                dbd.forEach((doc1)=>{
                    let x={
                        date:doc1.data().date,
                        company:doc1.data().company,
                        status:doc1.data().status,
                        salary:doc1.data().package
                    }
                    data1.history[i]=x;
                    data1.n=i
                    i=i+1
                })
                console.log(data1)
                res.render('placement_history.ejs',{data:data1});
            })
        })
    });
    
    
    
})
app.get('/dept_data',(req,res)=>{
    var id1=sessionStorage.getItem('id');
    console.log(id1);
    let data1={
        name:"",
        count:"",
        place:[],
    }
    db.collection('coordinator').where('id', '==', id1).get().then((dbd)=>{
        dbd.forEach((doc)=>{
            data1.name=doc.data().name;
            data1.count=Object.keys(doc.data().notifications).length;
            db.collection('placements').where('dept','==',doc.data().dept_id).get().then((dbd)=>{
                let i=0
                dbd.forEach((doc1)=>{
                    let x={
                        id:doc1.data().id,
                        passout:doc1.data().passout,
                        date:doc1.data().date,
                        company:doc1.data().company,
                        status:doc1.data().status,
                        salary:doc1.data().package
                    }
                    data1.place.push(x);
                    data1.n=i
                    i=i+1
                })
                console.log(data1)
                res.render('depart.ejs',{data:data1});
            })
        })
    });
})

app.post("/sub", (req, res) => {
    //let r=req.body.roll;
    //console.log(r);
    let data = {
        roll: req.body.roll,
        name: req.body.l_name + " " + req.body.f_name,
        dob: req.body.dob,
        gender: req.body.gender,
        mail: req.body.mail,
        phn: req.body.phn,
        address: {
            dr_n0: req.body.d_no,
            street: req.body.strt,
            place: req.body.vlg,
            pincode: req.body.pin
        },
        dept: req.body.dept
    };
    db.collection('student').add(data).then(
        res.render('form.ejs'));


})
app.listen(1234, () => {
    console.log("server started")
})