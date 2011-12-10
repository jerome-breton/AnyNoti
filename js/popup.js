jQuery(function(){
	var params = utils._extractUrlParams();
	var toaster = false;

	//Is an account specified ? Toaster case.
	if(typeof params.account !== 'undefined'){
		toaster = true;
		utils._includeCss('../css/toaster.css');
		window.setTimeout(function(){	window.close();	}, 15000);
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

		//If the service can display a list of messages
        if(result.account.service.implements.itemList){
            var list = result.account.service.itemList.call(result.account.service);
			var zIndex = 8999;
            jQuery.each(list,function(id,msg){

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
						window.close();
                        result.account.openLink(msg.link);
                    };
                }

				//Message title
				if(msg.title){
					var accountMessageTitle = document.createElement('h2');
					accountMessageTitle.innerText = msg.title;
					accountMessage.appendChild(accountMessageTitle);
				}

				//Message author
				if (msg.author && (msg.author.name || msg.author.email)) {
					var accountMessageAuthor = document.createElement('h3');
					if(msg.author.name && !msg.author.email){
						accountMessageAuthor.innerText = msg.author.name;
					}else if(!msg.author.name && msg.author.email){
						accountMessageAuthor.innerText = msg.author.email;
					}else if(msg.author.name && msg.author.email){
						accountMessageAuthor.innerText = msg.author.name + ' (' + msg.author.email + ')';
					}
					accountMessage.appendChild(accountMessageAuthor);
				}

				//Message body
				if (msg.summary) {
					var accountMessageSummary = document.createElement('p');
					accountMessageSummary.innerText = msg.summary;
					accountMessage.appendChild(accountMessageSummary);
				}
            });
        }
    });
});