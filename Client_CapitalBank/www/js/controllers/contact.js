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

// ***** AddEndpointController *****
// *********************************

module.controller("ContactController", function ($scope,$rootScope,$http) {

  $scope.addContact = function () {
    console.log("addContact");
    console.log("$rootScope.login: " + $rootScope.login);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://127.0.0.1:8085/api/createCount', true);
    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            console.log(json);
            if(json.succes === true){
                $rootScope.loadDataCount();
            }else{
                console.log("something went bad :(");
            }
        }};
        var data = JSON.stringify({"monLogin":$rootScope.login , "sonLogin":$scope.properties.hislogin, "nom": $scope.properties.nom, "prenom": $scope.properties.prenom});
        console.log(data);
        xhr.send(data);   
    };





/*
  $scope.addContact = function () {
            console.log("oxqadazdzadazddazdazhihezoifhzoehff");
            console.log($scope.compte)
     
  /*             var xhr = new XMLHttpRequest();
                xhr.open("POST", 'http://127.0.0.1:8085/api/createCount', true);
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
        //        var generatedMnemonic = new Mnemonic();
       //         $rootScope.properties.seed = generatedMnemonic.toString();
                $rootScope.submit(true, function(address){
                    console.log("address: " + address);
                    var data = JSON.stringify({"nom": "gchghc", "prenom": "hchgch", "cle": "ffxfxf"});
                    console.log(data);
                    xhr.send(data);
                })
            
   */ 
   //    };


     //  $scope.message="zdbvorubeouvbeorbv";

    /*    personne1= {
       	nom:'sdfsdf',
       	prenom:'sdcsdvsdv',
       	cle:'vdsdvsdvssv'

       };

        personne2= {
       	nom:'sdfsdf',
       	prenom:'szzzzzzzzzzzzzzzzzzzzzzz',
       	cle:'vdsdvsdvsv'

       };


        personne3= {
       	nom:'sdfsdf',
       	prenom:'sdcsdvsdv',
       	cle:'zzzzzzzzzzzzzzz'

       };

       var listCompte=[personne1,personne2,personne3];
       console.log(listCompte);
       $scope.listCompte=listCompte;   */
    });
