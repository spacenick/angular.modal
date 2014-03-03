var module = angular.module('ngMaleApp');

function getParamNames(fn) {
    var funStr = fn.toString();
    return funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^\s,]+)/g);
}

module.modal = function(modalName, fn) {

	var definitionData = fn();
	var link = definitionData.link;

	/// Split the $scope
	var paramsName = getParamNames(link);
	var linkInjection = paramsName.slice(1);


	//// Defin a directive of that name that is going to
	//// Wrap the modal
	module.directive(modalName, function($modal){

		return {

			scope: definitionData.scope,
			link: function(scope, elem, attrs) {


				//// We need to generate a resolve to pass the data to the modal
				var resolveObj = {};
				var controllerObj = ['$scope'];

				for (var key in definitionData.scope) {
					(function(key){
						resolveObj[key] = function() {
							return scope[key];
						};
						/// Also generate the controller injection
						controllerObj.push(key);
					})(key);
				}

				linkInjection.forEach(function(DI){
					controllerObj.push(DI);
				});

				/// Finalize controller obj
				controllerObj.push(function(){

					///// Catch back arguments here
					var args = [].slice.call(arguments, 0);

					var scope = args[0];

					var k = 1;

					//// Pass data to our scope from the arguments injected
					for (var key in definitionData.scope) {
						scope[key] = args[k];
						k++;
					}

					//// We need to 'jump over' the injected resolve
					var args = [scope].concat(args.slice(k));

					///// Call our definition function.
					link.apply(null, args);

				});



				//// We need to generate a controller that is basically gonna be the defined link fnuction
				//// Of our directive

				var modalOptions = {
					resolve: resolveObj,
					controller: controllerObj
				};
				/// Pass template
				if (angular.isString(definitionData.templateUrl)) modalOptions.templateUrl = definitionData.templateUrl;
				if (angular.isString(definitionData.template)) modalOptions.template = definitionData.template;
				/// Augment with extra options
				var extraOpts = angular.isObject(definitionData.modalOptions) ? definitionData.modalOptions : {};
				modalOptions = angular.extend(modalOptions, extraOpts);

				//// Take callback function from scope if possible

				var modalClosedSuccessFn = angular.isFunction(scope.callback) ? function(data){
					scope.callback(null, data);
				} : angular.noop;
				var modalClosedErrorFn = angular.isFunction(scope.callback) ? function(err){
					scope.callback(err);
				} : angular.noop;


				var modalInstance = $modal.open(modalOptions);
				modalInstance.result.then(modalClosedSuccessFn, modalClosedErrorFn);

			}




		}


	});

};
