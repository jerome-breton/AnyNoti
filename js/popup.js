jQuery(function(){
	var params = utils._extractUrlParams();
	var toaster = false;

	//Is an account specified ? Toaster case.
	if(typeof params.account !== 'undefined'){
		toaster = true;
		utils._includeCss('../css/toaster.css');
		window.setTimeout(function(){	window.close();	}, utils.options.toasterTimeout);
	}
    jQuery.each(utils.getBackgroundPage().results,function(index, result){
		//Leave if an account is specified and is not the one we are processing
		if(toaster && params.account != index){	return;	}

		//For each account, creation of a new section
        var accountSection = document.createElement("section");
		document.body.appendChild(accountSection);

		//With a title
        var accountTitle = document.createElement('h1');
		var accountTitleSpan = document.createElement('span');
		accountTitleSpan.innerText = result.text;
		accountTitle.appendChild(accountTitleSpan);
		accountSection.appendChild(accountTitle);

		//Linked to the home url of the account
        if(result.url){
            accountTitle.style.cursor="pointer";
            accountTitle.onclick=function(){
				if(result.list && result.account.service.parameters.itemHidingBehaviour==utils.constants.itemHidingBehaviour.onClick){
					jQuery.each(result.list,function(id,msg){
						utils.items.markAsRead(index,id);
					});
				}
				window.close();
                result.account.openLink(result.url);
            };
        }

		//With favicon
        if(result.account.service.implements.favicon){
            var accountFavicon = document.createElement('img');
            accountFavicon.src = result.account.service.favicon();
            accountTitle.insertBefore(accountFavicon,accountTitleSpan);
        }

		//With service color
		var color = result.account.color() || [128,128,128,255];
		color = [utils.color.getDarker(color), utils.color.getLighter(color)];
		accountTitle.style.background = '-webkit-linear-gradient(top, '
				+utils.color.toCssRgba(color[0])+' 0%, '
				+utils.color.toCssRgba(color[1])+' 65%, '
				+utils.color.toCssRgba(color[0])+' 100%)';
		accountTitle.style.borderColor = utils.color.toCssRgba(color[0]);
		accountFavicon.style.borderColor = utils.color.toCssRgba(color[0]);

		//If there is a list of messages
        if(result.list){
            var zIndex = 8999;
            jQuery.each(result.list,function(id,msg){
				//Mark as read on display ?
				if(result.account.service.parameters.itemHidingBehaviour==utils.constants.itemHidingBehaviour.onDisplay){
					utils.items.markAsRead(index,id);
				}

				//For each item we create an article
                var accountMessage = document.createElement('article');
				accountMessage.style.zIndex = zIndex--;
				accountSection.appendChild(accountMessage);

				//With service color
               	accountMessage.style.borderColor = utils.color.toCssRgba(color[0]);

				//With a link to the message url
                if(msg.link){
                    accountMessage.style.cursor="pointer";
                    accountMessage.onclick=function(){
						if(result.account.service.parameters.itemHidingBehaviour==utils.constants.itemHidingBehaviour.onClick){
							utils.items.markAsRead(index,id);
						}
						window.close();
                        result.account.openLink(msg.link);
                    };
                }

				//Message title
				if(msg.title){
					var accountMessageTitle = document.createElement('h2');
					accountMessageTitle.innerHTML = utils.stripTags(msg.title);
					accountMessage.appendChild(accountMessageTitle);
				}

				//Message author
				if (msg.author && (msg.author.name || msg.author.email)) {
					var accountMessageAuthor = document.createElement('h3');
					if(msg.author.name && !msg.author.email){
						accountMessageAuthor.innerHTML = utils.stripTags(msg.author.name);
					}else if(!msg.author.name && msg.author.email){
						accountMessageAuthor.innerHTML = utils.stripTags(msg.author.email);
					}else if(msg.author.name && msg.author.email){
						accountMessageAuthor.innerHTML = utils.stripTags(msg.author.name + ' (' + msg.author.email + ')');
					}
					accountMessage.appendChild(accountMessageAuthor);
				}

				//Message body
				if (msg.summary) {
					var accountMessageSummary = document.createElement('p');
					msg.summary = utils.stripTags(msg.summary);
					if(msg.summary.length>utils.options.maxSummaryLength){
						msg.summary = msg.summary.substr(0,msg.summary.substr(0,utils.options.maxSummaryLength).lastIndexOf(' '))+' ...';
					}
					accountMessageSummary.innerHTML = msg.summary;
					accountMessage.appendChild(accountMessageSummary);
				}
            });
        }
    });
});