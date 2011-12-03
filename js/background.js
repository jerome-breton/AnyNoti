//List of services helper by code
var services = {};
//List user accounts settings
var accounts = [];
//List results fo accounts checking
var results = {};
//List opened tabs index by accounts indexes
var tabs = {};

//Background worker
var background = {
    //List of timers (permits stoping them)
    accountsTimers : [],

    //Launch background processes
    init:function(){    this._log('init');

        //Create accounts checkers objects and time them
        this.launchAccountsCheckers();

        //Observes tabs closing to remove entries from tabs
        //permitting opening of a new tab on user click
        var that = this;
        chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
            that.tabRemoved(tabId,removeInfo);
        });
    },

    //Stop accounts checkers objects from checking
	stopAccountsCheckers:function (){		this._log('stopAccountsCheckers');
		jQuery.each(this.accountsTimers,function(index,timer){
			window.clearTimeout(timer);
		});
	},

    //Create accounts checkers objects and time them
	launchAccountsCheckers:function(){
		this.stopAccountsCheckers();
        this._log('launchAccountsCheckers');
        var that=this;
		jQuery.each(accounts,function(index, accountParams){
            that._log('launching account '+index);
			var account = function(index,accountParams){	return {
				name: 			accountParams.name || 'Account Name',	//account name
				type: 			accountParams.type || 'noop',	        //service code
				serviceOptions: accountParams.serviceOptions || {},		//service custom options
				frequency: 		accountParams.frequency || '60',	    //refresh frequency in sec
				index:(index || 0),

				//Creates a timeout to check for messages
				launchChecker:function(){   this._log('launchChecker');
					var timeout = (this.frequency || 60);   //defaults to 60sec
					timeout = Math.round((parseInt(timeout,10) + (Math.random() - 0.5) * 10) * 1000);  //Adds +-5sec random
					this._log('launchAccountChecker in '+timeout/1000 +'s');
					var that=this;
					background.accountsTimers[this.index] = window.setTimeout(function(){	that.check();	},timeout);
				},

				//Performs account check for messages
				check:function(){   this._log('checkAccount');
                    var that = this;
					if(!this.service){
						var service = services[this.type](
                            this.serviceOptions,
                            function(msg){that._log(msg);}
                        );
						if(!service){    return; }
						this.service = service;
					}
					if(this.service.implements.refresh){
						this.service.refresh(function(result){
							that.result = result;
							that.refreshCallback();
						});
					}
				},

				//Called after refresh has been performed by service
				refreshCallback:function(){ this._log('checkAccountCallback');
					this.launchChecker();
					if(this.result.isError){
						alert(this.result.errorMessage || 'Unknown Error');
					}else{
                        if(!results[this.index]){
                            results[this.index] = { account:this    };
                        }
                        if(this.service.implements.count){
							results[this.index]['account'] = this;
                            results[this.index]['count'] = this.service.count();
                            if(this.service.implements.homeUrl){
                                results[this.index]['url'] = this.service.homeUrl();
                            }
							if(this.service.implements.title && this.service.title()){
								results[this.index]['text'] = this.service.title();
							}else{
								results[this.index]['text'] = this.name;
							}
							if(results[this.index].count>0){
								results[this.index]['text'] += ' ('+results[this.index].count+')';
							}
                            background.refreshBadge();
                        }
                    }
				},

				//Provides functionnality to open links in the same tab per account
                openLink:function(url){ this._log('openLink');
					if(this.service.parameters.preventTabReloading && url.indexOf('#')==-1){
						url += '#'+Math.round(Math.random()*10000);
					}
					if(tabs[this.index]){
                            chrome.tabs.update(tabs[this.index].id,{url:url,selected:true});
                    }else{
						var that=this;
                        chrome.tabs.create({url:url}, function(tab){
							tabs[that.index] = tab;
                        });
                    }
                },
				_log:function(msg){
					that._log('[account-'+this.index+']'+msg);
				}
			}}(index,accountParams);
            //Check on start
			window.setTimeout(function(){	account.check();	},Math.round(Math.random()*2000));
		});
	},

	//Redisplays badge count/color in toolbar icon
	refreshBadge:function(){ this._log('refreshBadge');
		var count = 0;
        var accounts = 0;
        var badgeColor = null;
		jQuery.each(results,function(index,result){
			if(result.count){
				var localCount = parseInt(result.count,10);
                if(localCount<0){
                    results[index]['error'] = true;
                }else if(localCount>0){
                    count += localCount;
                    accounts += 1;
                    if(result.account.service.implements.color){
                        badgeColor = result.account.service.color();
                    }
                }
			}
		});
		if(count>0){
			chrome.browserAction.setBadgeText({text:count.toString()});
		}else{
			chrome.browserAction.setBadgeText({text:''});
		}
        if(!badgeColor || accounts!=1){
            badgeColor = utils.color.notToLight([20*count,128,128,255]);
        }
        chrome.browserAction.setBadgeBackgroundColor({color:badgeColor});
	},

	//Utility function for removing closed tag from tabs[], this permitting creating a new tab
    tabRemoved:function(tabId,removeInfo){ this._log('tabRemoved');
        var refreshFeeds = false;
        jQuery.each(tabs,function(index, tab){
            if(tab && tab.id == tabId){
                tabs[index] = null;
                refreshFeeds = true;
            }
        });
        if(refreshFeeds){
            this.launchAccountsCheckers();
        }
    },
    _log:function(msg){
        utils._log('[bg]'+msg);
    }
};

$(function(){background.init();});