services['gmail'] = function(customOptions,logFn){
    var options = {
        domain:null,        //if using non migrated Google Apps, then give a string of domain (ie: example.com)
        accountNumber:null, //if using multi-account, then give the account number (the one behind /u/ in the GMail url)
        label:null          //label to check, if empty, defaults to inbox
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
		serviceCode:'gmail',
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
                        case "timeout":     textStatus = errorThrown || "Gmail does not respond";  break;
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
            this._log('Found '+this._feed.find('feed>fullcount').text()+' messages');
            return this._feed.find('feed>fullcount').text();
        },
        homeUrl:function(){ this._log('homeUrl');
            if(!options.homeUrl){
                var url = this._baseUrl();
                url += (this.options.label?'#label/'+this.options.label:'#inbox');
                this._log('Home url :' + url);
                options.homeUrl = url;
            }
            return options.homeUrl;
        },
        itemList:function(){ this._log('itemList');
            var list = {};
            if(this._feed.find){
				var that=this;
                jQuery.each(this._feed.find('feed>entry'),function(index,msg){
                    msg = $(msg);
                    list[msg.find('id').text()] = {
                        title:msg.find('title').text() || '',
                        summary:msg.find('summary').text() || '',
                        link:that._improveUrl(msg.find('link').attr('href')) || '',
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
            if(options.domain){
                return "chrome://favicon/http://"+options.domain+"/";
            }else{
                return "chrome://favicon/http://mail.google.com/";
            }
        },
        color:function(){ this._log('color');
            return [225,30,30,255];
        },
		title:function(){	this._log('title');
			if(this._feed.find && this._feed.find('feed>title')){
				return this._feed.find('feed>title').text();
			}
			return false;
		},
		_baseUrl:function(){ this._log('_baseUrl');
			if(!options._baseUrl){
				var url = 'https://mail.google.com/';
				url += (this.options.accountNumber===null && this.options.domain?'a/'+this.options.domain:'mail') + '/';
				if(this.options.accountNumber!==null){    url += 'u/'+(parseInt(this.options.accountNumber,10) || 0) + '/';   }
				this._log('Base url :' + url);
				options._baseUrl = url;
			}
			return options._baseUrl;
		},
        _feedUrl:function(){ this._log('_feedUrl');
            if(!options.feedUrl){
                var url = this._baseUrl();
                url += 'feed/atom/';
                url += this.options.label || '';
                this._log('Feed url :' + url);
                options.feedUrl = url;
            }
            return options.feedUrl;
        },
		_improveUrl:function(url){	this._log('_improveUrl '+url);
			var re = new RegExp('message_id=([0-9a-f]*?)&');
			var m = re.exec(url);
			if(!m){	return url;	}
			return this._baseUrl() + '#all/' + m[1];
		}
    });
};