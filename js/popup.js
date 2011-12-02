jQuery(function(){
    jQuery.each(utils.getBackgroundPage().results,function(index, result){

		//For each account, creation of a new section
        var accountSection = document.createElement("section");
		document.body.appendChild(accountSection);

		//With a title
        var accountTitle = document.createElement('h1');
		accountTitle.innerText = result.text;
		accountSection.appendChild(accountTitle);

		//Linked to the home url of the account
        if(result.url){
            accountTitle.style.cursor="pointer";
            accountTitle.onclick=function(){
                result.account.openLink(result.url);
            };
        }

		//With favicon
        if(result.account.service.implements.favicon){
            var accountFavicon = document.createElement('img');
            accountFavicon.src = result.account.service.favicon();
            accountTitle.appendChild(accountFavicon);
        }

		//With service color
        if(result.account.service.implements.color){
            var c = [utils.color.getDarker(result.account.service.color()), utils.color.getLighter(result.account.service.color())];
            accountTitle.style.background = '-webkit-linear-gradient(top, '
                    +utils.color.toCssRgba(c[0])+' 0%, '
                    +utils.color.toCssRgba(c[1])+' 65%, '
                    +utils.color.toCssRgba(c[0])+' 100%)';
            accountTitle.style.borderColor = utils.color.toCssRgba(c[0]);
            accountFavicon.style.borderColor = utils.color.toCssRgba(c[0]);
        }

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
                if(result.account.service.implements.color){
                    accountMessage.style.borderColor = utils.color.toCssRgba(c[0]);
                }

				//With a link to the message url
                if(msg.link){
                    accountMessage.style.cursor="pointer";
                    accountMessage.onclick=function(){
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