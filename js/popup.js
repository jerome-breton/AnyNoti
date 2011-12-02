jQuery(function(){
    jQuery.each(utils.getBackgroundPage().results,function(index, result){
        var accountSection = document.createElement("section");
        var accountTitle = document.createElement('h1');
        if(result.url){
            accountTitle.style.cursor="pointer";
            accountTitle.onclick=function(){
                result.account.openLink(result.url);
            };
        }
        accountTitle.innerText = result.text;
        if(result.account.service.implements.favicon){
            var accountFavicon = document.createElement('img');
            accountFavicon.src = result.account.service.favicon();
            accountTitle.appendChild(accountFavicon);
        }
        if(result.account.service.implements.color){
            var c = [utils.color.getDarker(result.account.service.color()), utils.color.getLighter(result.account.service.color())];
            accountTitle.style.background = '-webkit-linear-gradient(top, '
                    +utils.getCssRgba(c[0])+' 0%, '
                    +utils.getCssRgba(c[1])+' 65%, '
                    +utils.getCssRgba(c[0])+' 100%)';
            accountTitle.style.borderColor = utils.getCssRgba(c[0]);
            accountFavicon.style.borderColor = utils.getCssRgba(c[0]);
        }
        accountSection.appendChild(accountTitle);
        if(result.account.service.implements.itemList){
            var list = result.account.service.itemList.call(result.account.service);
            jQuery.each(list,function(id,msg){
                var accountMessage = document.createElement('article');
                if(result.account.service.implements.color){
                    accountMessage.style.borderColor = utils.getCssRgba(c[0]);
                }
                if(msg.link){
                    accountMessage.style.cursor="pointer";
                    accountMessage.onclick=function(){
                        result.account.openLink(msg.link);
                    };
                }
                accountSection.appendChild(accountMessage);

                var accountMessageTitle = document.createElement('h2');
                accountMessageTitle.innerText = msg.title;
                accountMessage.appendChild(accountMessageTitle);

                var accountMessageAuthor = document.createElement('h3');
                accountMessageAuthor.innerText = msg.author;
                accountMessage.appendChild(accountMessageAuthor);

                var accountMessageSummary = document.createElement('p');
                accountMessageSummary.innerText = msg.summary;
                accountMessage.appendChild(accountMessageSummary);
            });
        }
        document.body.appendChild(accountSection);
    });
});