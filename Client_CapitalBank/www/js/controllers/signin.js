// Copyright 2015 Coinprism, Inc.
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

    $scope.register = function () {
        if($scope.properties.login != "" && $scope.properties.password != "" && $scope.properties.password == $scope.properties.password2 && $scope.properties.email != ""){
            var xhr = new XMLHttpRequest();
            xhr.open("POST", 'http://127.0.0.1:8085/api/createUser', true);
            //Send the proper header information along with the request
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var json = JSON.parse(xhr.responseText);
                    console.log(json);
                    if(json.succes === true){
                        $rootScope.login = $scope.properties.login;
                        console.log("$rootScope.login: " + $rootScope.login);
                        loadingEndpoints.then(function () {
                            $location.path("/");
                        });
                    }else{
                        console.log("something went bad :(");
                    }
                }};
            var generatedMnemonic = new Mnemonic();
            $scope.properties.seed = generatedMnemonic.toString();
            $scope.submit(true, function(address){
                console.log("address: " + address);
                var data = JSON.stringify({"login": $scope.properties.login, "email": $scope.properties.email, "password": $scope.properties.password, "wallet": $scope.properties.seed, "address": address, "banque":"CapitalBank"});
                console.log(data);
                xhr.send(data);
            })
        }
    };

    $scope.login = function () {
        if($scope.properties.login != "" && $scope.properties.password != ""){
            var xhr = new XMLHttpRequest();
            xhr.open("POST", 'http://127.0.0.1:8085/api/login', true);
            //Send the proper header information along with the request
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var json = JSON.parse(xhr.responseText);
                    console.log(json);
                    if(json.succes === true){
                        $rootScope.login = $scope.properties.login;
                        console.log("$rootScope.login: " + $rootScope.login);
                        $scope.properties.seed = json.data[0].Wallet;
                        $scope.submit();
                        $rootScope.loadDataCount();
                    }else{
                        console.log("something went bad :(");
                    }
                }};
            var data = JSON.stringify({"login": $scope.properties.login, "password": $scope.properties.password});
            xhr.send(data);
        }
    };

    $scope.submit = function (getAccount = false, callback = function(){}) {

        if (Mnemonic.isValid($scope.properties.seed)) {

            var worker = new Worker("js/derive.js");

            worker.addEventListener("message", function (hdKey) {
                $rootScope.$apply(function () {
                    var hdPrivateKey = new bitcore.HDPrivateKey(hdKey.data);
                    hdPrivateKey.network = bitcore.Networks.get("openchain");
                    console.log(walletSettings);
                    walletSettings.setRootKey(hdPrivateKey);
                    var endpoints = endpointManager.endpoints
                        for (var key in endpoints) {
                            endpoints = endpoints[key];
                            break;
                        }
                        endpoints.apiService.getRecordMutations(walletSettings.rootAccount + ":ACC:/asset/p2pkh/XpJVW9VbZD6UJF5YdCNJ7syTvEhFLHP1ke/").then(function (result) {
                            $rootScope.transactions = result.map(function (item) { return item.toHex(); });
                            $rootScope.transactions2 = []; 
                            var i = ($rootScope.transactions).length;
                            var ii = 0;
                            ($rootScope.transactions).forEach(function (transaction){
                                endpoints.apiService.getTransaction(transaction).then(function (details) {
                                     if (details == null) {
                                        $rootScope.transactions2.push({ key: "", valueDelta: "", value: "", date: ""});
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
                                                var val2 = walletSettings.rootAccount.valueOf().trim().normalize('NFC');                                               
                                                if( val1 === val2){
                                                    me = 1; him = 0
                                                }
                                                if(keys[me].name !== "/asset/p2pkh/XpJVW9VbZD6UJF5YdCNJ7syTvEhFLHP1ke/"){
                                                    ii +=  1;
                                                    return;
                                                }
                                                endpoints.apiService.getAccountRecord(keys[me].path.toString(), keys[me].name, details.mutation.records[me].version).then(function (previousRecord) {
                                                    ii +=  1;
                                                    var newValue = details.mutation.records[me].value == null ? null : encoding.decodeInt64(details.mutation.records[me].value.data);
                                                    $rootScope.transactions2.push({
                                                        key: akeys[him],
                                                        valueDelta: newValue == null ? null : newValue.subtract(previousRecord.balance),
                                                        value: newValue,
                                                        date: moment(details.transaction.timestamp.toString(), "X").format("MMMM Do YYYY, hh:mm:ss")
                                                    });
                                                }).then(function(){
                                                    console.log("ii = " + ii + " i = " + i);
                                                    if(ii != i) return;
                                                    $rootScope.transactions2.sort((a,b) => {
                                                        if (a.date < b.date)
                                                            return 1;
                                                        if (a.date > b.date)
                                                            return -1;
                                                        return 0;
                                                    });
                                                    console.log("transactions: ");
                                                    console.log($rootScope.transactions2);      
                                                    console.log("lenght: " + $rootScope.transactions2.length);
                                                });
                                            }
                                         }
                                     }
                                });
                            });                   
                        });
                    if(getAccount) {
                        console.log(walletSettings.rootAccount);
                        callback(walletSettings.rootAccount);
                    }else{
                        loadingEndpoints.then(function () {
                            $location.path("/");
                        });
                    }
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
