services['rss'] = function(customOptions,logFn){
    var options = {
        feedUrl:null,        //if using non migrated Google Apps, then give a string of domain (ie: example.com)
		itemHidingBehaviour:false
    };
    jQuery.extend(options,customOptions);
    return jQuery.extend(services['noop'](customOptions,logFn),{
        _feed:'',
        implements:{
            refresh:true,
            count:true,
            homeUrl:true,
            itemList:true,
            favicon:true,
            color:true,
			title:true
        },
		parameters:{
			preventTabReloading:true,	//Urls are opened with a trailing #0 preventing tab to be reload if the same url is called
			itemHidingBehaviour:options.itemHidingBehaviour
		},
		serviceCode:'rss',
        options:options,
        refresh:function(callback){ this._log('refresh');
            jQuery.ajax( this._feedUrl() , {
                context:this,
                success:function(data, textStatus, jqXHR){
                    this._feed = $(data);
                    callback(this,{
                                    isError : false,
                                    errorMessage : null
                                });
                },
                error:function(jqXHR, textStatus, errorThrown){
                    switch(textStatus){
                        case "timeout":     textStatus = errorThrown || "Feed does not respond";  break;
                        case "error":       textStatus = errorThrown || "You are not allowed";  break;
                        case "abort":       textStatus = errorThrown || "Connection aborted";  break;
                        case "parsererror": textStatus = errorThrown || "Not a valid XML";  break;
                        default:            textStatus = errorThrown || 'Unknown error';
                    }
                    this._log(textStatus);
                    this._feed = {};
                    callback(this,{
                                    isError : true,
                                    errorMessage : textStatus
                                });
                },
                dataType:'xml'
            });
        },
        count:function(){ this._log('count');
            if(!this._feed.find){   return -1;  }
			var c = this._feed.find('rss>channel>item').size() + this._feed.find('entry').size();
            this._log('Found '+c+' messages');
            return c;
        },
        homeUrl:function(){ this._log('homeUrl');
            if(!options.homeUrl && this._feed.find){
				options.homeUrl = this._feed.find('rss>channel>link').text()
						|| this._feed.find('link[rel=alternate]').attr('href')
						|| this._feed.find('link').attr('href');
            }
            return options.homeUrl;
        },
        itemList:function(){ this._log('itemList');
            var list = {};
            if(this._feed.find){
				var that=this;
                jQuery.each(this._feed.find('rss>channel>item'),function(index,msg){
                    msg = $(msg);
                    list[msg.find('guid').text()] = {
                        title:msg.find('title').text() || '',
                        summary:msg.find('description').text() || msg.find('content:encoded').text() || '',
                        link:msg.find('link').text() || '',
                        author:{
							name:msg.find('dc:creator').text() || ''//,
							//email:msg.find('author>email').text() || ''
						}
                    };
                });
				jQuery.each(this._feed.find('entry'),function(index,msg){
					msg = $(msg);
					list[msg.find('id').text()] = {
						title:msg.find('title').text() || '',
						summary:msg.find('summary').text() || msg.find('content').text() || '',
						link:msg.find('link').text() || '',
						author:{
							name:msg.find('author>name').text() || '',
							email:msg.find('author>email').text() || ''
						}
					};
				});
            }
            return list;
        },
        favicon:function(){ this._log('favicon');
            return "chrome://favicon/"+this.homeUrl();
        },
        color:function(){ this._log('color');
            return [164,100,0,255];
        },
		title:function(){	this._log('title');
			if(this._feed.find && this._feed.find('channel>title')){
				return this._feed.find('channel>title').text();
			}
			return false;
		},
        _feedUrl:function(){ this._log('_feedUrl');
            return options.feedUrl;
        }
    });
};