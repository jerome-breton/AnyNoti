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
            accountNumber:1,
			domain:'sqli.com',
            color:[0,0,0,255]
        },
        frequency:'15'
    };

    accounts[2] =  {
        name:'Newsletter (gmail)',
        type:'gmail',
        serviceOptions : {
            accountNumber:0,
            label:'newsletter',
            color:[0,0,133,255]
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

                //If this view has the right URL and hasn't been used yet...
                if (views[i].location.href == viewTabUrl) {
                    this._backgroundPage = views[i];
                    break;
                }
            }
        }
        return this._backgroundPage;
    },
    getLighterColor:function(color){
        return [
            Math.min(255,color[0]+128),
            Math.min(255,color[1]+128),
            Math.min(255,color[2]+128),
            Math.min(255,color[2]+128),
        ];
    },
    getCssRgba:function(color){
        return 'rgba('+color[0]+','+color[1]+','+color[2]+','+Math.round(color[3]/255,2)+')'
    }
};
