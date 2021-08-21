"use strict"
const sequelize = require('sequelize');
const serialport = require('serialport');
const Readline = require('@serialport/parser-readline');
const database = require('./models/database');
const con = require('./connection/connect');

require('colors');
var jsdiff = require('diff');
 
con.authenticate()
        .then(()=> {
            console.log('database connected..');
            connectPort();
         })
        .catch(err => console.log('Error:' + err))

// if(data.replace('\r','') == "ping")

const port = new serialport('COM15', {
    baudRate: 9600,
    autoOpen: false
})

function connectPort(){
    
    port.open( err => {
        if(err){
            console.log('Error opening port:', err.message);
            connectPort();
        }
    })
}


const parser = port.pipe(new Readline({ delimiter: '\n' }));
 port.on('open', () => {
    console.log('Serial Port Opened');
    port.write('1', err => {
        if(err){
            console.error(new Date(), 'Error:', err);
        }
    })
 parser.on('data', async data => {
    
       let event = data.replace('\r','');
       console.log(new Date(), `Event:: ${event}`);
       if(event == 'ping'){
           console.log(new Date(), 'ponging');
            port.write('1', err => {
                if(err){
                    console.error(new Date(), 'Error while pinging:', err);
                }
            })
       }else if(event[0] == '2'){
            let rfid = event.substring(1);
            try {
                record = await database.findOne({ where:{ rfid: rfid}})
            } catch (error) {
                console.log(new Date(), 'Error finding record');
                port.write('5', err => {
                    if(err){
                        console.error(new Date(), 'Error while sending status for finding the record:', err);
                    }
                })
            }
            if(record){
                if(new Date(record.UpdatedAt).getDate() == Date().getDate()){
                    port.write('4', err =>{
                        console.error(new Date(), 'Error while sending status for already given attendance');
                    })
                }else{
                    await database.update({ attendance: record.attendance + 1}, {where: {rfid: rfid}})
                    console.log(`The attendance for RFID: ${rfid} is updated.`)
                    port.write('3', err => {
                        if(err){
                            console.error(new Date(), 'Error while sending status attendance updating:', err);
                        }
                    })
                }
            }else{
                console(new Date(), 'Record does not exists!');
                port.write('5', err => {
                    if(err){
                        console.error(new Date(), 'Error while sending status for finding the record:', err);
                    }
                })
            }
            
       }
    })
})

