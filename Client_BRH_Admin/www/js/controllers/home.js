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
var sdk = require("openchain");
var Long = sdk.Long;

// ***** HomeController *****
// **************************

module.controller("HomeController", function ($scope, $rootScope, $location, controllerService, $route, $q, walletSettings, endpointManager, TransactionBuilder, validator, AssetData) {

    if (!controllerService.checkState())
        return;

    $rootScope.selectedTab = "home";

    $scope.rootAccount = walletSettings.rootAccount.toString();
    $scope.rawAddress = walletSettings.derivedKey.privateKey.toAddress().toString();
    $scope.endpoints = endpointManager.endpoints;
    $scope.display = "home";
    $scope.fields = {
        "sendTo": "",
        "sendAmount": "",
        "routeTo": "",
        "memo": ""
    };

    // Load all assets in the account
    var balance = [];

    function loadEndpoint(key) {
        var endpoint = endpointManager.endpoints[key];
        var dataModel = {
            endpoint: endpoint,
            state: "loading",
            assets: []
        };
        balance.push(dataModel);
        endpoint.apiService.getAccountRecords(walletSettings.rootAccount).then(function (result) {
            for (var itemKey in result) {
                var assetData = new AssetData(endpoint, result[itemKey].asset);
                assetData.setAccountBalance(result[itemKey]);
                dataModel.assets.push(assetData);
            }

            dataModel.state = "loaded";
        }, function () {
            dataModel.state = "error";
        }).then(function () {
            return $q.all(dataModel.assets.map(function (asset) {
                return asset.fetchAssetDefinition();
            }));
        });
    }

    for (var key in endpointManager.endpoints) {
        loadEndpoint(key);
    }

    $scope.balance = balance;

    // Handle click on the asset item
    $scope.sendAsset = function (asset) {
        $scope.sendingAsset = asset;
        $scope.display = "send";
        $scope.asset = asset;
        $scope.sendStatus = "send-active";
    };

    $scope.createBank = function () {
        console.log("createbank");
        if($scope.properties.name != ""){
            var xhr = new XMLHttpRequest();
            xhr.open("POST", 'http://127.0.0.1:8085/api/createBank', true);
            //Send the proper header information along with the request
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = function () {
                console.log('readystatechanged');
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var json = JSON.parse(xhr.responseText);
                    console.log(json);
                    if(json.succes === true){
                        $rootScope.getBanques();
                    }else{
                        console.log("something went bad :(");
                    }
                }};
            var generatedMnemonic = new Mnemonic();
            $scope.properties.seed = generatedMnemonic.toString();
            $scope.submit(true, function(address){
                console.log("address: " + address);
                var data = JSON.stringify({"name": $scope.properties.name, "wallet": $scope.properties.seed, "address": address});
                console.log(data);
                xhr.send(data);
            })
        }
    };

    $scope.submit = function (getAccount = false, callback = function(){}) {

        if (Mnemonic.isValid($scope.properties.seed)) {

            var worker = new Worker("js/derive.js");

            worker.addEventListener("message", function (hdKey) {
                $rootScope.$apply(function () {
                    var hdPrivateKey = new bitcore.HDPrivateKey(hdKey.data);
                    hdPrivateKey.network = bitcore.Networks.get("openchain");
                    walletSettings.setRootKey(hdPrivateKey);
                    $rootScope.rootAccount = walletSettings.rootAccount;

                    endpointManager.loadEndpoints().then(function () {
                        $rootScope.getBanques();
                        $rootScope.getClients();
                        callback(walletSettings.rootAccount);
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

    // Handle sending the asset
    $scope.confirmSend = function (destinationField) {
        var sendAmount = Long.fromString($scope.fields.sendAmount);
        var endpoint = $scope.asset.endpoint;
        var asset = $scope.asset.currentRecord;

        var memo = $scope.fields.memo;
        var routing = $scope.fields.routeTo;

        var transaction = new TransactionBuilder(endpoint);

        if (memo != "" || routing != "") {
            var metadata = {};
            if (memo != "") {
                metadata.memo = memo;
            }

            if (routing != "") {
                metadata.routing = routing;
            }

            transaction.setMetadata(metadata);
        }

        transaction.addAccountRecord(asset, sendAmount.negate());
        transaction.updateAccountRecord($scope.fields.sendTo, asset.asset, sendAmount).then(function () {
            return transaction.uiSubmit(walletSettings.derivedKey);
        }, function () {
            destinationField.$setValidity("invalidValue", false);
        });
    };

    $scope.validateAmount = function (amountField) {
        amountField.$setValidity("invalidNumber", validator.isNumber($scope.fields.sendAmount));
    };

    $scope.cancelSend = function () {
        $route.reload();
    }

    $scope.viewTransactions = function(transactions, client){
        console.log("view transactions on " );
        console.log(transactions);
        $scope.transactions = transactions;
        $scope.Clienttransactions = client.transactions2;
        $scope.Clienttransactions.sort((a,b) => {
            if (a.date < b.date)
                return 1;
            if (a.date > b.date)
                return -1;
            return 0;
        });
    }
});
