var Client = require('node-rest-client').Client;
var client = new Client(); 
var url = 'mongodb://localhost:27017/core';
var MongoClient = require('mongodb').MongoClient;

module.exports = (function() {
	'use strict';
	var common = {

		// login : function(request, response) {
		// 	this.connect(url,function(db){
		// 		var req = {
		// 			username : request.body.username,
		// 			password : request.body.password
		// 		};
		// 		db.collection('customers').findOne(req,function(err, result) {
		// 			if (err) {
		// 				response.send({message:"Error connecting mongodb",status:"error"});
		// 			} else if (result) {
		// 				var url = 'mongodb://localhost:27017/' + result.merchantId;
		// 				const deepstream = require('deepstream.io-client-js');

		// 				const deep_client = deepstream('localhost:6020').login();
		// 				var record = deep_client.record.getRecord('deep_stream-'+result.merchantId);

		// 				MongoClient.connect(url, function(err, db2) {
		// 					db2.collection('eventLogs').find({}).toArray(function(err, docs) {
		// 						record.set('cloverEventLogs', docs);
		// 					});
		// 				});		

		// 				response.send(result);				
		// 			} else {
		// 				response.send({message:"Customer not found",status:"error"});						
		// 			}
		// 			db.close();						
		// 		});			
		// 	});
		// },

		// signUp : function(request, response) {
		// 	this.connect(url,function(db) {
		// 		var data = {
		// 			username : request.body.username,
		// 			password : request.body.password,
		// 			merchantId : request.body.merchantId,
		// 			apiToken : request.body.apiToken,
		// 			type : request.body.accountType
		// 		};
		// 		var req = {
		// 			username : request.body.username
		// 		};
		// 		db.collection('customers').findOne(req,function(err, result) {
		// 			if (!err && !result) {
		// 				db.collection('customers').insertOne(data,function(err, result) {
		// 					if (err) {
		// 						response.send({message:"Error connecting mongodb",status:"error"})
		// 					} else {
		// 						response.send({message:"Signup successfully",status:"success"});
		// 					}
		// 				});
		// 			} else {
		// 				response.send({"message" : "Username already exists", "status" : "error"});
		// 			}
		// 			db.close();
		// 		});					
		// 	});		
		// },

		connect : function (url, callback) {
			MongoClient.connect(url, function(err, db) {
				if (err) {
					console.log("Error connecting mongodb");
				} else {
					console.log("Mongodb connected");
					callback(db);
				}
			});			
		}
	}

	return common;

})();