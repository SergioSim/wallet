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
        if($scope.properties.login != "" && $scope.properties.password != "" && $scope.properties.password == $scope.properties.password2){
            var xhr = new XMLHttpRequest();
            xhr.open("POST", 'http://127.0.0.1:8085/api/createUser', true);
            //Send the proper header information along with the request
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var json = JSON.parse(xhr.responseText);
                    console.log(json);
                    if(json.succes === true){
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
                var data = JSON.stringify({"login": $scope.properties.login, "password": $scope.properties.password, "wallet": $scope.properties.seed, "address": address});
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
                        console.log("YES");
                        $scope.properties.seed = json.data[0].Wallet;
                        $scope.submit();
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
