const express = require('express');
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const https = require("https");
const { stringify } = require('querystring');
const { log } = require('console');
const encrypt = require('mongoose-encryption'); 
const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');  
app.use(express.static("public"));


/////////////////////////  DATABASE CONNECTION /////////////////////////////////////////////

const url = "mongodb://127.0.0.1:27017/B2B";
mongoose.connect(url)
.then(()=>console.log("Connected to B2B"))
.catch((Err)=>console.log("Something went wrong in connection with DB"))



const user_schema = new mongoose.Schema({
    email  : String,
    password : String,
    user_type : String
})

const purchase_schema = new mongoose.Schema({
    seller : String,
    product : String,
    qty : Number
})

const deal_schema = new mongoose.Schema({
    email : String,
    product : String,
    qty : Number,
    rate : Number
})

// const secret = "NeverGiveUp";
// user_schema.plugin(encrypt, {secret : secret, encryptedFields: ["password"] });

const User = new mongoose.model("user",user_schema);

const Purchase = new mongoose.model("purchase",purchase_schema);

const Deal = new mongoose.model("deal",deal_schema)

/////////////////////////  GET METHODDS /////////////////////////////////////////////

app.get('/', (req, res) => { 
    res.render(__dirname + "/views/login.ejs");

});
app.get('/login.ejs', (req, res) => { 
    res.render(__dirname + "/views/login.ejs");

});

var ProductList = [];

app.get('/products.ejs', (req, res) => { 

    res.render(__dirname + "/views/products.ejs");
});


app.get('/kart.html', (req, res) => { 
    res.sendFile(__dirname + "/views/kart.html")
});


app.get('/weather.ejs', (req, res) => { 
    res.render(__dirname  + "/views/weather.ejs");
});


app.get('/sell.ejs', (req, res) => { 
    res.render(__dirname + "/views/sell.ejs");
    // res.sendFile(__dirname + "/views/sell.html");
});


app.get('/buy.ejs', (req, res) => { 
    res.render(__dirname + "/views/buy.ejs");
    // res.sendFile(__dirname + "/views/sell.html");
});


app.get('/regi', (req, res) => { 
    res.sendFile(__dirname + "/views/regi.html");    
});


app.get('/contact.html', (req, res) => { 
    res.sendFile(__dirname + "/views/contact.html")
});


/////////////////////////  POST METHODDS /////////////////////////////////////////////
app.post('/regi', (req, res) => { 

        //console.log(req.body.users);
        // Store hash in your password DB.
        const newUser = new User ({
        email : req.body.username,
        password : req.body.password,
        user_type : req.body.users
    })
    newUser.save()
    .then(()=>res.sendFile(__dirname + "/views/success.html"))
    .catch((err)=>res.send("Can't Save  register!"))
    
});    


app.post('/sell.ejs', (req, res) => { 
   
    const newDeal = new Deal ({
        email : req.body.email,
        product : req.body.product,
        qty : req.body.quantity,
        rate : req.body.rate
    })
    newDeal.save()
    .then(()=>res.sendFile(__dirname + "/views/sold.html"))
    .catch((err)=>res.send("Can't Save sell !" + err))
}); 


app.post('/buy.ejs', (req, res) => { 
    // console.log("Sellerv ID : " + req.body.seller);
    const newPurchase = new Purchase ({
        seller : req.body.seller,
        product : req.body.product,
        qty : req.body.quantity
    })
    newPurchase.save()
    .then(()=>res.sendFile(__dirname + "/views/ord_placed.html"))
    .catch((err)=>res.send("Can't Save buy "+err))

});


app.post('/products.ejs', (req, res) => { 

    Deal.find()
    .then((val)=>{
    val.forEach(function(element){
            const allProducts = {
                Email : element.email,
                Product : element.product,
                Qty : element.qty,
                Rate : element.rate
            }
            res.render(__dirname + "/views/products", {data : allProducts});
        });
    })

});



app.post('/login.ejs', (req, res) => { 
    
    const username  = req.body.email;
    const password  = req.body.password;

    User.find()
    .then((val)=>{
        val.forEach(element => {
            if(element.email === username && element.password === password){
                console.log(element);
                res.render(__dirname + "/views/index.ejs")
            }
        });
    })
    .catch((err)=>console.log("Something went wrong in login!"+err))

});



app.post('/weather.ejs', function (req, res) {


    const city = req.body.city;       //console.log(city);
       
    const url ="https://api.openweathermap.org/data/2.5/weather?q="+city+"&appid=2abbc39a94a21304a435d266a7562597&units=metric";

    https.get(url,function(resp){
        console.log("The status code : "+resp.statusCode);
            resp.on("data",function(data){
                // console.log(data);  //This data will be in the hexdec format so will convert it into readable format
                
                const weatherData = JSON.parse(data);           console.log(weatherData);
                const des = weatherData.weather[0].description; //console.log(des);
                const w = weatherData.main.temp;                //console.log(w);
                const icon = weatherData.weather[0].icon;       //console.log(icon);
//Example       console.log("SPEED "+weatherData.wind.speed);
                // console.log("Humidity " + weatherData.main.humidity);
                const imgURL = "https://openweathermap.org/img/wn/"+icon+"@2x.png"; 

                const weatherDataObj = {
                    DES : des,
                    W : w,
                    IMGURL : imgURL,
                    CITY : city
                }
                res.render(__dirname  + "/views/weatherOut.ejs", {data:weatherDataObj});
         
        })
    })
    

})

app.listen(port, () => console.log(`Server Started! on ${port}`));





































 // var i = 0;
    // Deal.find()
    // .then((val)=>{
    // val.forEach(function(element){
    //     console.log("Element : "+ ++i);
    //     const allProducts = {
    //         Email : element.email,
    //         Product : element.product,
    //         Qty : element.qty,
    //         Rate : element.rate
    //     }
    //     ProductList.push(allProducts)
    //     console.log("PRO LIST");
    //     console.log(ProductList);
    //     });
    //     res.render(__dirname + "/views/products", {data : ProductList});
    // })
    // .catch((err)=>console.log("Something went wrong in product !"))