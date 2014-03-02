var module = angular.module('app');

module.modal = function(modalName, fn) {

	setTimeout(function(){

		var definitionData = angular.element('body').injector().invoke(fn);


		var link = definitionData.link;

		//// Defin a directive of that name that is going to
		//// Wrap the modal
		module.directive(modalName, function($injector, $modal){

			return {

				scope: definitionData.scope,
				link: function(scope, elem, attrs) {


					//// We need to generate a resolve to pass the data to the modal
					var resolveObj = {};
					var controllerObj = ['$scope'];

					for (var key in definitionData.scope) {
						resolveObj[key] = function() {
							return scope[key];
						};
						/// Also generate the controller injection
						controllerObj.push(key);
					}

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


						///// Call our definition function.
						link(scope);



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

	}, 0);

};

