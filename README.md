Angular.Modal
===

Brings a .modal method on your module to write modals (using angular-ui $modal service) just like if you were writing a directive.

```javascript
angular.module('myApp')
.modal('mySexyModal', function($rootScope, YouCanInject, Everything, As, Usual, Here){
    
    //// Directive-like API
    return {
        template: "<div>{{wattup}}</div>",
        scope: {
            "wattup": "=",
            //// NB: callback is a special scope property
            //// If passed a function, it will be triggered when the modal is closed/dismissed
            "callback": "="
        },  
        // NB : no elem or attrs in that link function
        link: function(scope) {
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
