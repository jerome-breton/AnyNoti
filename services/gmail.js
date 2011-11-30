services['gmail'] = function(customOptions){
    var options = {
        domain:null,        //if using non migrated Google Apps, then give a string of domain (ie: example.com)
        accountNumber:null, //if using multi-account, then give the account number (the one behind /u/ in the GMail url)
        label:null          //label to check, if empty, defaults to inbox
    };
    jQuery.extend(options,customOptions);
    return {
        _feed:'',
        implements:{
            refresh:true,
            count:true,
            homeUrl:true,
            itemList:true
        },
        options:options,
        refresh:function(callback){
            jQuery.ajax( this._getFeedUrl() , {
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
        count:function(){
            if(!this._feed.find){   return -1;  }
            this._log('Found '+this._feed.find('feed>fullcount').text()+' messages');
            return this._feed.find('feed>fullcount').text();
        },
        baseUrl:function(){
            if(!options.baseUrl){
                var url = 'https://mail.google.com/';
                url += (this.options.domain?'a/'+this.options.domain:'mail') + '/';
                if(!this.options.domain && this.options.accountNumber!==null){    url += 'u/'+(parseInt(this.options.accountNumber,10) || 0) + '/';   }
                this._log('Base url :' + url);
                options.baseUrl = url;
            }
            return options.baseUrl;
        },
        homeUrl:function(){
            if(!options.homeUrl){
                var url = this.baseUrl();
                url += (this.options.label?'#label/'+this.options.label:'');
                this._log('Home url :' + url);
                options.homeUrl = url;
            }
            return options.homeUrl;
        },
        itemList:function(){
            var list = {};
            if(this._feed.find){
                jQuery.each(this._feed.find('feed>entry'),function(index,msg){
                    console.log(msg);
                    msg = $(msg);
                    list[msg.find('id').text()] = {
                        title:msg.find('title').text() || '',
                        summary:msg.find('summary').text() || '',
                        link:msg.find('link').attr('href') || '',
                        author:msg.find('author>name').text() + '(' + msg.find('author>email').text() + ')' || ''
                    };
                });
            }
            return list;
        },
        _getFeedUrl:function(){
            if(!options.feedUrl){
                var url = this.baseUrl();
                url += 'feed/atom/';
                url += this.options.label || '';
                this._log('Feed url :' + url);
                options.feedUrl = url;
            }
            return options.feedUrl;

        },
        _log:function(msg){
            console.log('[gmail]'+msg);
        }
    };
};