var services = {};
var accounts = [];
var results = {};
var tabs = {};
var background = {
    accountsTimers : [],
	stopAccountsCheckers:function (){
		console.log('stopAccountsCheckers');
		jQuery.each(this.accountsTimers,function(index,timer){
			window.clearTimeout(timer);
		});
	},

	launchAccountsCheckers:function(){
		this.stopAccountsCheckers();
		console.log('launchAccountsCheckers');
        var that=this;
		jQuery.each(accounts,function(index, accountParams){
            that._log('launching account '+index);
			var account = function(index,accountParams){	return {
				name: 			accountParams.name || 'Account Name',	//account name
				type: 			accountParams.type || 'noop',	        //service code
				serviceOptions: accountParams.serviceOptions || {},		//service custom options
				frequency: 		accountParams.frequency || '60',	    //refresh frequency in sec
				index:(index || 0),
                tab:null,
				launchChecker:function(){
					var timeout = (this.frequency || 60);   //defaults to 60sec
					timeout = Math.round((parseInt(timeout,10) + (Math.random() - 0.5) * 10) * 1000);  //Adds +-5sec random
					this._log('launchAccountChecker in '+timeout/1000 +'s');
					var that=this;
					background.accountsTimers[this.index] = window.setTimeout(function(){	that.check();	},timeout);
				},
				check:function(){
					this._log('checkAccount');
					if(!this.service){
						var service = services[this.type](this.serviceOptions);
						if(!service){    return; }
						this.service = service;
					}
					if(this.service.implements.refresh){
						this._log(this.type + '.checkAccount');
						var that=this;
						this.service.refresh(function(result){
							that.result = result;
							that.refreshCallback();
						});
					}
				},
				refreshCallback:function(){
					this._log('checkAccountCallback');
					this.launchChecker();
					if(this.result.isError){
						alert(this.result.errorMessage || 'Unknown Error');
					}else{
                        if(!results[this.index]){
                            results[this.index] = { account:this    };
                        }
                        if(this.service.implements.count){
                            results[this.index]['count'] = this.service.count();
                            if(this.service.implements.homeUrl){
                                results[this.index]['url'] = this.service.homeUrl();
                            }
                            results[this.index]['text'] = this.name + ' ('+results[this.index].count+')';
                            background.refreshBadge();
                        }
                    }
				},
                openLink:function(url){
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
					console.log('[account-'+this.index+']'+msg);
				}
			}}(index,accountParams);
			window.setTimeout(function(){	account.check();	},Math.round(Math.random()*2000));
		});
	},

	refreshBadge:function(){
		var count = 0;
		jQuery.each(results,function(index,result){
			if(result.count){
				var localCount = parseInt(result.count,10);
                if(localCount<0){
                    results[index]['error'] = true;
                }else{
                    count += localCount;
                }
			}
		});
		if(count>0){
			chrome.browserAction.setBadgeText({text:count.toString()});
		}else{
			chrome.browserAction.setBadgeText({text:''});
		}
	},
    _log:function(msg){
        console.log('[background]'+msg);
    }
};

$(function(){background.launchAccountsCheckers();});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	jQuery.each(tabs,function(index, tab){
		if(tab && tab.id == tabId){
			tabs[index] = null;
		}
	});
});