var foaly = angular.module('foaly', [])

function mainController ($scope, $http) {
  $scope.bmc = {}
  $scope.output = ''

  $scope.sendBMC = function () {
    $http.post('/api/bmc', $scope.bmc)
      .success(function (data) {
        $scope.bmc = {}
        console.log('Data from bmc request: ' + JSON.stringify(data))
        $scope.output = data.output
      })
      .error(function (data) {
        console.log('Error: ' + data)
      })
  }
}
