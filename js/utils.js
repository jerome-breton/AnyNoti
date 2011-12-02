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

	//Retrieve the background page for use in other places (popup,...)
    getBackgroundPage:function(){   this._log('getBackgroundPage');
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

	//Set of functions for manipulating colors
    color:{
        notToDark:function(color){   this._log('notToDark');
            return [
                Math.max(20,color[0]),
                Math.max(20,color[1]),
                Math.max(20,color[2]),
               color[3]
            ];
        },
        notToLight:function(color){   this._log('notToLight');
            return [
                Math.min(235,color[0]),
                Math.min(235,color[1]),
                Math.min(235,color[2]),
                color[3]
            ];
        },
        getLighter:function(color){   this._log('getLighter');
            return this.notToLight([
                color[0]+64,
                color[1]+64,
                color[2]+64,
                color[3]
            ]);
        },
        getDarker:function(color){   this._log('getDarker');
            return this.notToDark([
                color[0]-64,
                color[1]-64,
                color[2]-64,
                color[3]
            ]);
        },
		toCssRgba:function(color){   this._log('toCssRgba');
		  return 'rgba('+color[0]+','+color[1]+','+color[2]+','+Math.round(color[3]/255,2)+')'
		},
        _log:function(msg){
            utils._log('[color]'+msg);
        }
    },
    _log:function(msg){ //return;
        console.log('[utils]'+msg);
    }
};
