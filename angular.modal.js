var module = angular.module('ngMaleApp');

module.modal = function(modalName, fn, stateObject) {

	var definitionData = fn();
	var link = definitionData.link;

	/// The fn is the last element;
	var linkFn = link[link.length - 1];

	/// Split the $scope
	var paramsName = link.slice(0, link.length - 1);
	var linkInjection = paramsName.slice(1);


	var scopeObj = _.clone(definitionData.scope);
	/// Always pass a callback to support modals
	if (!scopeObj.callback) scopeObj.callback = "=";

	//// Defin a directive of that name that is going to
	//// Wrap the modal
	module.directive(modalName, function($modal){

		return {

			scope: scopeObj,
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
					linkFn.apply(null, args);

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
					elem.remove();
					scope.callback(null, data);
				} : function() {
					elem.remove();
				};

				var modalClosedErrorFn = angular.isFunction(scope.callback) ? function(err){
					elem.remove();
					scope.callback(err);
				} : function() {
					elem.remove();
				};


				var modalInstance = $modal.open(modalOptions);
				modalInstance.result.then(modalClosedSuccessFn, modalClosedErrorFn);

			}




		}


	});


	if (angular.isObject(stateObject)) {
		// ---------------------------
		// State Params Binding
		// ---------------------------

		// stateParms object syntax:
		// {
		// 	stateName: "me.xxx.xxxx.whatever",
		// 	url: "/user/me/chat/myCategoryModal/:categoryId"
		// 	parent: "me.chat",
		// 	resolve: {
		// 		// Classic resolve object
		// 		category: ['$stateObject', function($stateObject) {
		// 			return Parse.Object.getClass("Category").fetchById($stateObject.categoryId);
		// 		}],
		// 		/// Callback as a special resolve property!
		// 		/// Under the hood, it will always close the modal and go back to parent state
		// 		callback: ['$rootScope', function($rootScope){
		// 			$rootScope.$broadcast('myModalHasBeenClosed')
		// 		}]
		// 	},
		// 	/// Optional, u can give one if u want to do extra work
		// 	/// it wont have access to the modal scope so its for third party processing
		// 	/// like analytics or whatever
		// 	controller: []
		// }

		// CamelCase -> to-dashed
		var camelCaseToDashed = function(str) {
			return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
		}


		var customCallbackFn = !angular.isUndefined(stateObject.resolve) && !angular.isUndefined(stateObject.resolve.callback) ? stateObject.resolve.callback : angular.noop;
		var customController = !angular.isUndefined(stateObject.controller) ? stateObject.controller : angular.noop;

		module.config(['$stateProvider', function($stateProvider){


			/// Generate a resolve fn
			var resolveObj = angular.isObject(stateObject.resolve) ? stateObject.resolve : {};

			resolveObj.callback = ['$state', '$injector', function($state, $injector) {
				return function() {
					$state.go(stateObject.parent);
					var controllerFn = $injector.invoke(customCallbackFn);
					controllerFn.call(null, arguments);
				}
			}]


			/// Generate a controller function (array syntax) injecting our resolve
			var controllerFn = [];
			// Always inject the $scope first
			controllerFn.push('$scope');
			// Loop over the resolve obj to inject dependencies that will all be given to the modal
			_.keys(resolveObj).forEach(function(resolveKey){
				controllerFn.push(resolveKey);
			});
			// Add the $injector at the end too
			controllerFn.push('$injector');

			// And finally the controller function itself
			controllerFn.push(function(){
				var args = [].slice.call(arguments, 0);

				var $scope = args[0];

				// Generate our modal DOM
				var domStr = "<div " + camelCaseToDashed(modalName);

				// Current args index
				var argsIndex = 1;
				_.keys(resolveObj).forEach(function(resolveKey){
					$scope[resolveKey] = args[argsIndex];
					domStr += ' ' + camelCaseToDashed(resolveKey) + '="' + resolveKey + '"';
					argsIndex++;
				});

				// Close domStr
				domStr += '></div>';

				var $injector = args[argsIndex];
				var $compile = $injector.get('$compile');
				var elem = $compile(domStr)($scope);
				$('body').append(elem);

			});


			var resolveObject = _.clone(resolveObj);

			$stateProvider.state(stateObject.stateName, {
				url: stateObject.url,
				parent: stateObject.parent,
				/// Use the main injectModal ui-view defined in index.html
				views: {
					'injectedModal@': {
						resolve: resolveObject,
						controller: controllerFn
					}
				}
			})


		}])

	}



};
