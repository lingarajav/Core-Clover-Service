var common = require('../controller/common.js');
var syncRequest = require('sync-request');
var Client = require('node-rest-client').Client;
var client = new Client();

module.exports = (function() {
	'use strict';
	var baseUrl = "https://api.clover.com/v3/merchants/";
	var coreBaseUrl = "http://localhost:4000/core/api/";

	var merchantId;
	
	var cloverwebhook = {
		   	
    	cloverWebhookEvent : function (request, response) {
		    var url = 'mongodb://localhost:27017/core';
			var args = "";   		
			var merchants = request.body.merchants;
			for(var key in merchants) {
				merchantId = key;
				common.connect(url, function(db){
					var req = {
						merchantId : merchantId
					};
				
					db.collection('customers').findOne(req,function(err, result) {
						if (result) {
							args = {
								headers : {"Authorization" : "Bearer " + result.apiToken}
							};
							if (result.type.toLowerCase() == "sandbox") {
								baseUrl = "https://apisandbox.dev.clover.com/v3/merchants/";
							}
						}
					db.close();		  
			  var arr = merchants[key];
				for (var i in arr) {
					var object = arr[i].objectId;
				    var type = object.split(":");
				    var option = type[0];
				    var optionId = type[1];
				    if (option == "P") {
				    	var cloverInfo = {};
						client.get(baseUrl + merchantId + "/payments/" + optionId + "?expand=cardTransaction,dccInfo,germanInfo,appTracking,taxRates,lineItemPayments,refunds,order,tender,employee", args, function (paymentData, res) {
							cloverInfo.paymentData = paymentData;
							console.log("payment");
							if(paymentData.hasOwnProperty("order")){
								client.get(baseUrl + merchantId + "/orders/" + paymentData.order.id + "?expand=lineItems,customers,payments,credits,refunds,serviceCharge,discounts", args, function (orderData, res) {
									console.log("order");
									cloverInfo.orderData = orderData;
									cloverInfo.paymentData.cardTransaction.cardholderName = "katherine";									
									if(orderData.hasOwnProperty("customers")){
										console.log("customer");										
										var res = syncRequest('GET', baseUrl + merchantId + "/customers/" + orderData.customers.elements[0].id + "?expand=addresses,emailAddresses,phoneNumbers,cards,metadata", args);
										cloverInfo.customerData = JSON.parse(res.getBody('utf8'));										
									}
									searchCustomer(cloverInfo);
								});
							}
						});														    					    	
				    }
				}
					});
				});
		    }
	
			response.send({"status" : "success", "message" : "Webhook called successfully"});
    	}
	}
	
	function searchCustomer (cloverInfo) {	
		var req = {
			data : cloverInfo,
			headers : {"Content-Type" : "application/json"}			
		}
		console.log(JSON.stringify(cloverInfo));
		client.post(coreBaseUrl + 'customer/search', req, function(data,res){
			if (data.length != 1) {
				createCustomer(cloverInfo,data.length + " records");
			} else {
				saveSalesInfo(cloverInfo,data._id);
				savePaymentInfo(cloverInfo,data._id);
			}
		});

	}
	
	function saveSalesInfo(cloverInfo, custId) {
		for (var i=0; i<cloverInfo.orderData.lineItems.elements.length; i++) {
			var req = {
				data : {
					custId : custId,
					merchantId : merchantId,
					POSInvNo : cloverInfo.orderData.id,
					productId : cloverInfo.orderData.lineItems.elements[i].id,
					date : new Date(),
					paidAmount : cloverInfo.orderData.total
				},
				headers : {
					"Content-Type" : "application/json"
				}
			}
			client.post(coreBaseUrl + "sales/insert", req, function(data,res){
				console.log(data);
			});
		}
	}
	
	function savePaymentInfo(cloverInfo, custId) {
		var req = {
			data : {
				POSPaymentId : cloverInfo.paymentData.id,
				amount : cloverInfo.paymentData.amount,
				cardHolderName : cloverInfo.paymentData.cardTransaction.cardholderName,
				date : new Date(),
				POSInvNo : cloverInfo.paymentData.order.id
			},
			headers : {
				"Content-Type" : "application/json"
			}
		}
		client.post(coreBaseUrl + "payment/insert", req, function(data,res){
			console.log(data);
		});		
	}
	
	function createCustomer(cloverInfo, comment) {
		var req= {};
		if (cloverInfo.hasOwnProperty("customerData")) {
			req.POSCustId = cloverInfo.customerData.id;
			req.firstName = cloverInfo.customerData.firstName;
			req.lastName = cloverInfo.customerData.lastName;
			if (cloverInfo.customerData.phoneNumbers.elements > 0)
			req.phoneNumber = cloverInfo.customerData.phoneNumbers.elements[0].phoneNumber;
			req.email = cloverInfo.customerData.emailAddresses.elements[0].emailAddress;
			if (cloverInfo.customerData.addresses.elements > 0) {
				req.address1 = cloverInfo.customerData.addresses.elements[0].address1;
				req.address2 = cloverInfo.customerData.addresses.elements[0].address2;
				req.address3 = cloverInfo.customerData.addresses.elements[0].address3;
				req.city = cloverInfo.customerData.addresses.elements[0].city;
				req.state = cloverInfo.customerData.addresses.elements[0].state;
				req.country = cloverInfo.customerData.addresses.elements[0].country;
				req.zip = cloverInfo.customerData.addresses.elements[0].zip;
			}
		} else {
			req.firstName = cloverInfo.paymentData.cardTransaction.cardholderName;
			req.cardHolderName = cloverInfo.paymentData.cardTransaction.cardholderName;
		}
		
		var reqObj = {
			data : req,
			headers : {"Content-Type" : "application/json"}
		}
		client.post(coreBaseUrl + "customer/insert" , reqObj, function (data, res) {
			var falloutObj = {
				data : {
					custId : data._id,
					comment : comment
				},
				headers : {"Content-Type" : "application/json"}					
			}
			client.post(coreBaseUrl + "fallout/insert" , falloutObj, function (data, res) {				
			});
			saveSalesInfo(cloverInfo,data._id);
			savePaymentInfo(cloverInfo,data._id);
		});		
	}
	
	return cloverwebhook;

})();
