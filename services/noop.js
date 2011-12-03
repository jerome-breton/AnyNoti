services['noop'] = function(customOptions,logFn){
    var options = {};
    jQuery.extend(options,customOptions);
    return {
        implements:{
            refresh:false,
            count:false,
            homeUrl:false,
            itemList:false,
            favicon:false,
            color:false,
			title:false
        },
		parameters:{
			preventTabReloading:true	//Urls are opened with a trailing #0 preventing tab to be reload if the same url is called
		},
		serviceCode:'noop',
        options:options,

		/**
		 * Called at each timeout to request data to the website
		 *
		 * @var callback Method to call after request to inform about any problems
		 */
        refresh:function(callback){
			this._log('refresh');
			return callback(this,{
				isError : false,
				errorMessage : null
			});
		},

		/**
		 * Give the unread messages count
		 *
		 * @return Number of messages or negative value in case of error
		 */
        count:function(){
			this._log('count');
		},

		/**
		 * Give the home url of the website
		 */
        homeUrl:function(){
			this._log('homeUrl');
		},

		/**
		 * Returns an object of unread items
		 *
		 * list[{msgUniqueId}] = {
		 *		title:{title of message} || '',
		 *		summary:{summary of message} || '',
		 * 		link:{link to the message on website} || '',
		 * 		author:{
		 * 			name:{author name} || '',
		 *			email:{author email} || ''
		 *  	}
		 * };
		 *
		 */
        itemList:function(){
			this._log('itemList');
			var list = {};
			return list;
		},

		/**
		 * Returns favicon link for this service/account
		 */
        favicon:function(){
			this._log('favicon');
			return "chrome://favicon/http://example.com";
		},

		/**
		 * Returns color of this account in an RVBA array of values from 0 to 255
		 * This color will be brightened and darkened for design purposes.
		 * Try to choose something in the middle for the best effect?
		 */
        color:function(){
			this._log('color');
			return [128,128,128,255];
		},

		/**
		 * Returns the title of the feed
		 */
		title:function(){
			this._log('title');
		},

		/**
		 * Provides logging
		 * @param msg
		 */
        _log:function(msg){			logFn('['+this.serviceCode+']'+msg);	        }
    };
};