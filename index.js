const express = require('express');
const { rmSync } = require('fs');
const path = require('path');
const port = 3000;

const db = require('./config/mongoose');
const Contact = require('./models/contact');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded());
app.use(express.static('assets'));

app.get('/', function (req, res) {
    Contact.find({}, function(err, contacts) {
        if(err) {
            console.log('Error in fetching the contacts from db');
            return;
        }
        return res.render('home', {
            title: "Contact List",
            contact_list: contacts
        });
    })
});

app.get('/new', function (req, res) {
    return res.render('new', {
        title: "New Contact"
    });
});

function addContact(contact) {
    Contact.create({
        name: contact.name,
        phone: contact.phone,
        email: contact.email
    }, function(err, newContact) {
        if(err) {
            console.log('Error in creating a contact');
            return;
        }
        console.log(newContact);
    })
}

app.post('/create-contact', function (req, res) {
    // Using database now
    console.log(req.url);

    //check if the new email or phone number exists already, if yes, return without adding
    Contact.find({$or:[{'email': req.body.email}, {'phone': req.body.phone}]}, function(err, docs) {
        if(err) {
            console.log('Error while finding');
        }
        if(docs.length == 0) {
            console.log('Adding new contact');
            addContact(req.body);
        }
        else {
            console.log("Phone or Email already exists! Can't add new contact.");
        }
    });

    return res.redirect('/');
});

// for deleting a contact
app.get('/delete-contact/', function(req, res) {
    // Deleting from database
    let id = req.query.id;
    
    // find the contact in the database using id and delete
    Contact.findByIdAndDelete(id, function(err) {
        if(err) {
            console.log('Error in deleting an object from db');
            return;
        }
        return res.redirect('back');
    })
});

app.listen(port, function(err) {
    if(err) {
        console.log('Error in running the server', err);
        return;
    }

    console.log('Yup! My first express server is running on port:', port);
});