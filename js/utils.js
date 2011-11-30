if(typeof accounts !== 'undefined'){
    accounts[0] = {
        name:'Jerome Breton (gmail)',
        type:'gmail',
        serviceOptions : {
            accountNumber:0
        },
        frequency:'15'
    };

    accounts[1] = {
        name:'Sqli (gmail)',
        type:'gmail',
        serviceOptions : {
            accountNumber:1
        },
        frequency:'15'
    };

    accounts[2] =  {
        name:'Newsletter (gmail)',
        type:'gmail',
        serviceOptions : {
            accountNumber:0,
            label:'newsletter'
        },
        frequency:'15'
    };

}

var utils = {
    _backgroundPage:null,
    getBackgroundPage:function(){

        if(!this._backgroundPage){
            var viewTabUrl = chrome.extension.getURL('html/background.html');

            //Look through all the pages in this extension to find one we can use.
            var views = chrome.extension.getViews();
            for (var i = 0; i < views.length; i++) {
                var view = views[i];

                //If this view has the right URL and hasn't been used yet...
                if (view.location.href == viewTabUrl) {
                    this._backgroundPage = view;
                    break;
                }
            }
        }
        return this._backgroundPage;
    }
};
