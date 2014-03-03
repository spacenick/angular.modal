Angular.Modal
===

Brings a .modal method on your module to write modals (using angular-ui $modal service) just like if you were writing a directive.

```javascript
angular.module('myApp')
/// NB : There is NO DI on the definition function
/// Pass all the dependencies u want to the link function, after the first argument (scope)
.modal('mySexyModal', function(){
    
    //// Directive-like API
    return {
        template: "<div>{{wattup}}</div>",
        scope: {
            "wattup": "=",
            //// NB: callback is a special scope property
            //// If passed a function, it will be triggered when the modal is closed/dismissed
            "callback": "="
        },  
        // NB : no elem or attrs in that link function, scope is ALWAYS first argument
        // and the rest is parsed by angular DI
        link: function(scope, $rootScope, YouCanPass, AllYourDI, Here) {
            /// All your modal logic here
        }
        
    }
    
});
```
Then you can use it just like a directive

```
<div my-sexy-modal wattup="myData" callback="onClose"></div>
```

Most use cases will require the modal to be injected after an action or so:

```javascript
var newScope = $scope.$new();
newScope.myData = "yo";
newScope.onClose = function(err, data) {
    if (err) console.log("Modal dismissed!");
    else console.log("Modal closed with payload " + JSON.stringify(data));
}
var elem = $compile('<div my-sexy-modal wattup="myData" callback="onClose"></div>')(newScope);
$('body').append(elem);
```

This is a WIP and VERY alpha. 
