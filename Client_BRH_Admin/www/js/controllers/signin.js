﻿// Copyright 2015 Coinprism, Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var module = angular.module("OpenchainWallet.Controllers");
var bitcore = require("bitcore-lib");
var Mnemonic = require("bitcore-mnemonic");

module.controller("SignInController", function ($scope, $rootScope, $location, endpointManager, controllerService, walletSettings) {

    if (!controllerService.checkState())
        return;

    var loadingEndpoints = endpointManager.loadEndpoints();

    $rootScope.selectedTab = "none";

    var generatedMnemonic = new Mnemonic();
    $scope.properties = { seed: "" };
    $scope.display = "signin";

    $scope.generate = function () {
        var generatedMnemonic = new Mnemonic();
        $scope.passphrase = generatedMnemonic.toString();
        $scope.display = "passphrase";
    };

    $scope.back = function () {
        $scope.display = "signin";
    };

    $rootScope.getClients = function () {
        console.log("get Clients ");
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://127.0.0.1:8085/api/clientList?banque=*", true);
        //Send the proper header information along with the request
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var json = JSON.parse(xhr.responseText);
                console.log(json);
                if(json.succes === true){
                    $rootScope.clientList = json.data;
                    ($rootScope.clientList).forEach(client => {
                        var endpoints = endpointManager.endpoints
                        for (var key in endpoints) {
                            endpoints = endpoints[key];
                            break;
                        }
                        endpoints.apiService.getRecordMutations(client.Address + ":ACC:/asset/p2pkh/XpJVW9VbZD6UJF5YdCNJ7syTvEhFLHP1ke/").then(function (result) {
                            client.transactions = result.map(function (item) { return item.toHex(); });
                            client.transactions2 = []; 
                            (client.transactions).forEach(function (transaction){
                                endpoints.apiService.getTransaction(transaction).then(function (details) {
                                     if (details == null) {
                                         client.transactions2.push({ key: "", valueDelta: "", value: "", date: ""});
                                     }
                                     else {
                                         if(details.mutation.records.length == 2) {
                                            var keys = [RecordKey.parse(details.mutation.records[0].key), RecordKey.parse(details.mutation.records[1].key)];
                                            if(keys[0].recordType == "ACC"){
                                                var akeys = [];
                                                akeys.push("/p2pkh/" + keys[0].path.parts[1] + "/");
                                                akeys.push("/p2pkh/" + keys[1].path.parts[1] + "/");
                                                var me = 0;
                                                var him = 1;
                                                var val1 = akeys[him].valueOf().trim().normalize('NFC');
                                                var val2 = client.Address.valueOf().trim().normalize('NFC');                                               
                                                if( val1 === val2){
                                                    me = 1; him = 0
                                                }
                                                if(keys[me].name !== "/asset/p2pkh/XpJVW9VbZD6UJF5YdCNJ7syTvEhFLHP1ke/") return;
                                                endpoints.apiService.getAccountRecord(keys[me].path.toString(), keys[me].name, details.mutation.records[me].version).then(function (previousRecord) {
                                                    var newValue = details.mutation.records[me].value == null ? null : encoding.decodeInt64(details.mutation.records[me].value.data);
                                                    client.transactions2.push({
                                                        key: akeys[him],
                                                        valueDelta: newValue == null ? null : newValue.subtract(previousRecord.balance),
                                                        value: newValue,
                                                        date: moment(details.transaction.timestamp.toString(), "X").format("MMMM Do YYYY, hh:mm:ss")
                                                    });
                                                });
                                            }
                                         }
                                     }
                                });
                            });                            
                            endpoints.apiService.getAccountRecord(client.Address, "/asset/p2pkh/XpJVW9VbZD6UJF5YdCNJ7syTvEhFLHP1ke/").then(function (res) {
                                client.Balance = res.balance.low;
                            });
                        });
                    });
                    console.log($scope.clientList);
                }else{
                    console.log("something went bad :(");
                }
            }};
        xhr.send();   
    };

    $rootScope.getBanques = function () {
        console.log("get Banques ");
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://127.0.0.1:8085/api/banquesList", true);
        //Send the proper header information along with the request
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var json = JSON.parse(xhr.responseText);
                console.log(json);
                if(json.succes === true){
                    $rootScope.banquesList = json.data;
                    console.log($scope.banquesList);
                }else{
                    console.log("something went bad :(");
                }
            }};
        xhr.send();   
    };

    $scope.submit = function () {

        if (Mnemonic.isValid($scope.properties.seed)) {

            var worker = new Worker("js/derive.js");

            worker.addEventListener("message", function (hdKey) {
                $rootScope.$apply(function () {
                    var hdPrivateKey = new bitcore.HDPrivateKey(hdKey.data);
                    hdPrivateKey.network = bitcore.Networks.get("openchain");
                    walletSettings.setRootKey(hdPrivateKey);

                    loadingEndpoints.then(function () {
                        $rootScope.getBanques();
                        $rootScope.getClients();
                        $location.path("/");
                    });
                })
            }, false);

            worker.postMessage({ mnemonic: $scope.properties.seed });

            $scope.display = "loading";
        }
        else {
            $scope.properties.signinForm.seed.$setValidity("invalidSeed", false);
        }
    };
});
