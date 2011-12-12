if(typeof accounts !== 'undefined'){
	var a = 0;
    accounts[a++] = {
        name:'Jerome Breton (gmail)',
        type:'gmail',
        serviceOptions : {
            accountNumber:0
        },
        frequency:'15'
    };

    accounts[a++] = {
        name:'Sqli (gmail)',
        type:'gmail',
        serviceOptions : {
            accountNumber:1,
			domain:'sqli.com'
        },
		serviceOverloads : {
			color:[0,0,0,255]
		},
        frequency:'15'
    };

    accounts[a++] =  {
        name:'Newsletter (gmail)',
        type:'gmail',
        serviceOptions : {
            accountNumber:0,
            label:'newsletter'
        },
		serviceOverloads : {
			color:[0,0,133,255]
		},
        frequency:'15'
    };

	accounts[a++] = {
		name:'jQuery',
		type:'rss',
		serviceOptions : {
			feedUrl : "http://feeds.feedburner.com/jquery/",
			itemHidingBehaviour:1
		}
	};

	accounts[a++] = {
		name:'Thinkgeek',
		type:'rss',
		serviceOptions : {
			feedUrl : "http://feeds.feedburner.com/thinkgeek/whatsnew",
			itemHidingBehaviour:1
		},
		serviceOverloads : {
			color:[133,67,30,255]
		}
	};

	accounts[a++] = {
		name:'Frandroid',
		type:'rss',
		serviceOptions : {
			feedUrl : "http://www.frandroid.com/feed/atom/",
			itemHidingBehaviour:2
		},
		serviceOverloads : {
			color:[110,166,39,255]
		}
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

	//Global parameters
	options:{
		maxSummaryLength : 100,
		toasterTimeout : 15000
	},

	//Constants
	constants:{
		itemHidingBehaviour:{
			none:false,
			onClick:1,
			onDisplay:2
		}
	},

	items:{
		read:null,
		markAsRead:function(index,id){
			var readItems = utils.items.getRead(index);
			readItems[id] = new Date();
			utils.items.save(index,readItems);
			var bgPage = utils.getBackgroundPage();
			if(bgPage.results[index] && bgPage.results[index].count){
				bgPage.results[index].count--;
				if(bgPage.results[index].list){
					delete bgPage.results[index].list[id];
				}
			}
			bgPage.background.refreshBadge();
			return true;
		},
		markAsUnread:function(index,id){
			var readItems = utils.items.getRead(index);
			delete readItems[id];
			utils.items.save(index,readItems);
			return true;
		},
		isRead:function(index,id){
			var readItems = utils.items.getRead(index);
			var isRead = readItems[id] || false;
			if(isRead){	//Touch the entry to set its date to now
				readItems[id] = new Date();
				utils.items.save(index,readItems);
			}
			return isRead;
		},
		getRead:function(index){
			var bgPage = utils.getBackgroundPage();
			if(!bgPage.utils.items.read){
				try{
					bgPage.utils.items.read = JSON.parse(localStorage["readItems"]);
				}catch(e){
					bgPage.utils.items.read = {};
				}

				//Clean older entries
				var now = new Date();
				jQuery.each(bgPage.utils.items.read,function(account,readItems){
					jQuery.each(readItems,function(id,date){
						date = new Date(date);	//Date is stored as a string
						bgPage.utils.items.read[account][id] = date;
						if((now-date) > 30*24*60*60*1000){
							delete bgPage.utils.items.read[account][id];
						}
					});
				});
			}
			if(!bgPage.utils.items.read[index]){
				bgPage.utils.items.read[index] = {};
			}
			return bgPage.utils.items.read[index];
		},
		save:function(index,readItems){
			var bgPage = utils.getBackgroundPage();
			bgPage.utils.items.read[index] = readItems;
			localStorage["readItems"] = JSON.stringify(bgPage.utils.items.read);
		}
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
			color = this.rectify(color);
            return this.rectify([
                (color[0]+32)*1.25,
                (color[1]+32)*1.25,
                (color[2]+32)*1.25,
                color[3]
            ]);
        },
        getDarker:function(color){   this._log('getDarker');
			color = this.rectify(color);
            return this.rectify([
                (color[0]-32)*.75,
                (color[1]-32)*.75,
                (color[2]-32)*.75,
                color[3]
            ]);
        },
		rectify:function(color){	this._log('rectify');
			color = this.notToLight(this.notToDark(color));
			return [
				Math.round(color[0]),
				Math.round(color[1]),
				Math.round(color[2]),
				Math.round(color[3])
			];
		},
		toCssRgba:function(color){   this._log('toCssRgba');
			color = this.rectify(color);
			return 'rgba('+color[0]+','+color[1]+','+color[2]+','+Math.round(color[3]/255,2)+')'
		},
        _log:function(msg){
            utils._log('[color]'+msg);
        }
    },
	loadServices:function(){   this._log('loadServices');
		utils._include("../services/noop.js");
		utils._include("../services/rss.js");
		utils._include("../services/gmail.js");
	},
	//Strip HTML Tags (but keeps &chars;)
	stripTags:function(str){	this._log('stripTags');
		return str.replace(/(<([^>]+)>)/ig,"");
	},
	_include:function(file){   this._log('_include '+file);
		var script  = document.createElement('script');
		script.src  = file;
		script.type = 'text/javascript';
		script.defer = true;
		document.getElementsByTagName('head').item(0).appendChild(script);
	},
	_includeCss:function(file){   this._log('_includeCss '+file);
		var stylesheet  = document.createElement('link');
		stylesheet.href  = file;
		stylesheet.type = 'text/css';
		stylesheet.rel = 'stylesheet';
		document.getElementsByTagName('head').item(0).appendChild(stylesheet);
	},
	_extractUrlParams:function(){   this._log('_extractUrlParams');
		var paramsStrings = location.search.substring(1).split('&');
		var params = {};
		for (var i=0; i<paramsStrings.length; i++) {
			var slices = paramsStrings[i].split('=');
			params[slices[0]]=slices[1];
		}
		return params;
	},
    _log:function(msg){ return;
        console.log('[utils]'+msg);
    }
};

var services = [];
jQuery(function(){utils.loadServices();});